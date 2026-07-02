import type { AppSettings, PartialSettings, ThemeMode } from '@shared/settings'
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  migrateSettings,
} from '@shared/settings'
import type { StoredOrder } from '@shared/orders'

export const ORDERS_CHANGED_EVENT = 'orders-changed'
export const SETTINGS_CHANGED_EVENT = 'settings-changed'

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

export function setSettingsInCache(partial: PartialSettings): void {
  cache.settings = mergeSettings(cache.settings, partial)
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
  // migrateSettings fills fields missing from older app versions' data.
  cache.settings = migrateSettings(remote.settings)
  cache.orders = remote.orders
  cache.onboardingCompleted = remote.onboardingCompleted

  try {
    window.localStorage.setItem('theme', cache.theme)
  } catch {
    // ignore
  }
}
