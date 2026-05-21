import type { AppSettings, QuickSelectSettings } from './settings'
import type { ThemeMode } from './theme'
import type { StoredOrder } from './order-utils'

export const ORDERS_CHANGED_EVENT = 'orders-changed'
export const SETTINGS_CHANGED_EVENT = 'settings-changed'

const DEFAULT_QUICK_SELECT: QuickSelectSettings = {
  cardSignatures: [],
  instructionSuggestions: [],
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
  }
  cache.orders = remote.orders
  cache.onboardingCompleted = remote.onboardingCompleted

  try {
    window.localStorage.setItem('theme', cache.theme)
  } catch {
    // ignore
  }
}
