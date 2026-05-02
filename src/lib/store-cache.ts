import type { AppSettings, CompanyInfo } from './settings'
import type { ThemeMode } from './theme'
import type { StoredOrder } from './order-utils'

export const ORDERS_CHANGED_EVENT = 'orders-changed'

const DEFAULT_SETTINGS: AppSettings = {
  archiveRetention: 7,
  rowsPerPage: 14,
  company: {
    name: 'Blomster i Byhaven AS',
    address: 'Olav Tryggvasonsgt. 28',
    postCode: '7011 Trondheim',
    phone: '73522460',
  },
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
    company: { ...cache.settings.company, ...(partial.company ?? {}) },
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

function migrateLegacyLocalStorage(): Partial<Cache> {
  const migrated: Partial<Cache> = {}
  try {
    const legacyTheme = window.localStorage.getItem('theme')
    if (
      legacyTheme === 'light' ||
      legacyTheme === 'dark' ||
      legacyTheme === 'auto'
    ) {
      migrated.theme = legacyTheme
    }
    window.localStorage.removeItem('theme')
  } catch {
    // ignore
  }

  try {
    const legacySettingsRaw = window.localStorage.getItem('app_settings')
    if (legacySettingsRaw) {
      const parsed = JSON.parse(legacySettingsRaw) as Partial<AppSettings>
      migrated.settings = {
        archiveRetention:
          parsed.archiveRetention ?? DEFAULT_SETTINGS.archiveRetention,
        rowsPerPage: parsed.rowsPerPage ?? DEFAULT_SETTINGS.rowsPerPage,
        company: {
          ...DEFAULT_SETTINGS.company,
          ...((parsed.company ?? {}) as Partial<CompanyInfo>),
        },
      }
    }
    window.localStorage.removeItem('app_settings')
  } catch {
    // ignore
  }

  try {
    const legacyOrdersRaw = window.localStorage.getItem('ordreflyt_orders')
    if (legacyOrdersRaw) {
      migrated.orders = JSON.parse(legacyOrdersRaw) as Record<
        string,
        StoredOrder
      >
    }
    window.localStorage.removeItem('ordreflyt_orders')
  } catch {
    // ignore
  }

  return migrated
}

export async function hydrateStoreCache(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const remote = await window.electronAPI.store.getAll()
  cache.theme = remote.theme
  cache.settings = remote.settings
  cache.orders = remote.orders

  const legacy = migrateLegacyLocalStorage()
  if (legacy.theme && remote.theme === 'auto') {
    cache.theme = legacy.theme
    void window.electronAPI.store.setTheme(legacy.theme)
  }
  if (legacy.settings) {
    cache.settings = legacy.settings
    void window.electronAPI.store.setSettings(legacy.settings)
  }
  if (legacy.orders && Object.keys(remote.orders).length === 0) {
    cache.orders = legacy.orders
    void window.electronAPI.store.setOrders(legacy.orders)
  }
}
