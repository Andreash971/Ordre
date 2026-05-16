import type { AppSettings, QuickSelectSettings } from './settings'
import type { ThemeMode } from './theme'
import type { StoredOrder } from './order-utils'

export const ORDERS_CHANGED_EVENT = 'orders-changed'

const DEFAULT_QUICK_SELECT: QuickSelectSettings = {
  cardSignatures: [
    'Med vennlig hilsen',
    'Kjærlig hilsen',
    'Klem fra',
    'Hjertelig gratulerer',
    'Hilsen',
  ],
  instructionSuggestions: [
    'Ring før ankomst',
    'Sett på trappen hvis ingen åpner',
    'Levér til nabo ved fravær',
    'Bruk bakinngangen',
  ],
}

const DEFAULT_SETTINGS: AppSettings = {
  archiveRetention: 7,
  rowsPerPage: 14,
  defaultPrinter: null,
  company: {
    name: 'Blomster i Byhaven AS',
    address: 'Olav Tryggvasonsgt. 28',
    postCode: '7011 Trondheim',
    phone: '73522460',
  },
  quickSelect: DEFAULT_QUICK_SELECT,
}

type Cache = {
  theme: ThemeMode
  settings: AppSettings
  orders: Record<string, StoredOrder>
}

const cache: Cache = {
  theme: 'auto',
  settings: DEFAULT_SETTINGS,
  orders: {},
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
  }
  void window.electronAPI.store.setSettings(partial)
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

export async function hydrateStoreCache(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const remote = await window.electronAPI.store.getAll()
  cache.theme = remote.theme
  cache.settings = {
    ...DEFAULT_SETTINGS,
    ...remote.settings,
    quickSelect: remote.settings.quickSelect ?? DEFAULT_QUICK_SELECT,
  }
  cache.orders = remote.orders

  try {
    window.localStorage.setItem('theme', cache.theme)
  } catch {
    // ignore
  }
}
