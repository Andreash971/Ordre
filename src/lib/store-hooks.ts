/**
 * Reactive access to the persisted store. Any component that renders
 * settings, theme, orders, or onboarding state should use these hooks —
 * they re-render automatically when the store changes anywhere in the app.
 */
import { useMemo, useSyncExternalStore } from 'react'

import type { CustomerType } from '@shared/customers'
import { enabledCustomerTypes } from '@shared/modules'
import type { ModulesSettings } from '@shared/modules'
import type { AppSettings, ThemeMode } from '@shared/settings'
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

export function useOnboardingCompleted(): boolean {
  return useStoreSnapshot().onboardingCompleted
}

/** Which optional feature modules are enabled. */
export function useModules(): ModulesSettings {
  return useSettings().modules
}

/** The customer types whose module is enabled, in fixed schema order. */
export function useEnabledCustomerTypes(): Array<CustomerType> {
  const modules = useModules()
  return useMemo(() => enabledCustomerTypes(modules), [modules])
}
