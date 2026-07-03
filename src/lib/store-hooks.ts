/**
 * Reactive access to the persisted store. Any component that renders
 * settings, theme, orders, or onboarding state should use these hooks —
 * they re-render automatically when the store changes anywhere in the app.
 */
import { useSyncExternalStore } from 'react'

import type { AppSettings, ThemeMode } from '@shared/settings'
import type { StoredOrder } from '@shared/orders'
import type { StoreSnapshot } from './store-cache'
import { getCache, subscribeToStore } from './store-cache'

export function useStoreSnapshot(): StoreSnapshot {
  return useSyncExternalStore(subscribeToStore, getCache)
}

export function useSettings(): AppSettings {
  return useStoreSnapshot().settings
}

export function useTheme(): ThemeMode {
  return useStoreSnapshot().theme
}

export function useOrders(): Record<string, StoredOrder> {
  return useStoreSnapshot().orders
}

export function useOnboardingCompleted(): boolean {
  return useStoreSnapshot().onboardingCompleted
}
