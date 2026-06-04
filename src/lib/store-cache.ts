import type {
  AppSettings,
  QuickSelectSettings,
  SpecialItemsSettings,
} from './settings'
import type { ThemeMode } from './theme'
import type { StoredOrder } from './order-utils'

export const ORDERS_CHANGED_EVENT = 'orders-changed'
export const SETTINGS_CHANGED_EVENT = 'settings-changed'

const DEFAULT_QUICK_SELECT: QuickSelectSettings = {
  cardSignatures: [],
  instructionSuggestions: [],
}

const DEFAULT_SPECIAL_ITEMS: SpecialItemsSettings = {
  frakt: { name: 'Frakt', price: 100 },
  leveringstid: { name: 'Leveringstid', price: 100 },
  kort: { name: 'Kort', price: 25 },
}

const DEFAULT_SETTINGS: AppSettings = {
  archiveRetention: 7,
  rowsPerPage: 14,
  defaultPrinter: null,
  company: {
    name: '',
    displayName: '',
    address: '',
    postCode: '',
    phone: '',
  },
  quickSelect: DEFAULT_QUICK_SELECT,
  bringApi: {
    uid: '',
    apiKey: '',
  },
  specialItems: DEFAULT_SPECIAL_ITEMS,
}

type Cache = {
  theme: ThemeMode
  settings: AppSettings
  orders: Record<string, StoredOrder>
  onboardingCompleted: boolean
}

const cache: Cache = {
  theme: 'auto',
  settings: DEFAULT_SETTINGS,
  orders: {},
  onboardingCompleted: false,
}

let hydrated = false

export function getCache(): Cache {
  return cache
}

export function setThemeInCache(mode: ThemeMode): void {
  cache.theme = mode
  void window.electronAPI.store.setTheme(mode)
}

export function setSettingsInCache(partial: Partial<AppSettings>): void {
  cache.settings = {
    archiveRetention:
      partial.archiveRetention ?? cache.settings.archiveRetention,
    rowsPerPage: partial.rowsPerPage ?? cache.settings.rowsPerPage,
    defaultPrinter:
      partial.defaultPrinter !== undefined
        ? partial.defaultPrinter
        : cache.settings.defaultPrinter,
    company: { ...cache.settings.company, ...(partial.company ?? {}) },
    quickSelect: partial.quickSelect
      ? { ...cache.settings.quickSelect, ...partial.quickSelect }
      : cache.settings.quickSelect,
    bringApi: { ...cache.settings.bringApi, ...(partial.bringApi ?? {}) },
    specialItems: partial.specialItems
      ? {
          frakt: {
            ...cache.settings.specialItems.frakt,
            ...partial.specialItems.frakt,
          },
          leveringstid: {
            ...cache.settings.specialItems.leveringstid,
            ...partial.specialItems.leveringstid,
          },
          kort: {
            ...cache.settings.specialItems.kort,
            ...partial.specialItems.kort,
          },
        }
      : cache.settings.specialItems,
  }
  void window.electronAPI.store.setSettings(partial)
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT))
}

export function setOrdersInCache(orders: Record<string, StoredOrder>): void {
  cache.orders = orders
  void window.electronAPI.store.setOrders(orders)
  window.dispatchEvent(new CustomEvent(ORDERS_CHANGED_EVENT))
}

export function clearOrdersInCache(): void {
  cache.orders = {}
  void window.electronAPI.store.clearOrders()
  window.dispatchEvent(new CustomEvent(ORDERS_CHANGED_EVENT))
}

export function completeOnboardingInCache(): void {
  cache.onboardingCompleted = true
  void window.electronAPI.store.setOnboardingCompleted(true)
}

export async function hydrateStoreCache(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const remote = await window.electronAPI.store.getAll()
  cache.theme = remote.theme
  // Persisted settings from older app versions may lack newer fields; merge defaults.
  const remoteSettings = remote.settings as Partial<AppSettings>
  cache.settings = {
    ...DEFAULT_SETTINGS,
    ...remoteSettings,
    company: { ...DEFAULT_SETTINGS.company, ...(remoteSettings.company ?? {}) },
    quickSelect: remoteSettings.quickSelect ?? DEFAULT_QUICK_SELECT,
    bringApi: remoteSettings.bringApi ?? DEFAULT_SETTINGS.bringApi,
    specialItems: {
      frakt: {
        ...DEFAULT_SPECIAL_ITEMS.frakt,
        ...(remoteSettings.specialItems?.frakt ?? {}),
      },
      leveringstid: {
        ...DEFAULT_SPECIAL_ITEMS.leveringstid,
        // Migrate values previously stored under the old `fraktTidspunktstillegg` key.
        // Remove on or after 2026-09-28 — by then any user who has launched the app
        // since the rename will have re-persisted under the new key.
        ...((remoteSettings.specialItems as Record<string, unknown> | undefined)
          ?.fraktTidspunktstillegg as Partial<{ name: string; price: number }>
          | undefined ?? {}),
        ...(remoteSettings.specialItems?.leveringstid ?? {}),
      },
      kort: {
        ...DEFAULT_SPECIAL_ITEMS.kort,
        ...(remoteSettings.specialItems?.kort ?? {}),
      },
    },
  }
  cache.orders = remote.orders
  cache.onboardingCompleted = remote.onboardingCompleted

  try {
    window.localStorage.setItem('theme', cache.theme)
  } catch {
    // ignore
  }
}
