import type {
  AppSettings,
  BringApiCredentials,
  CompanyInfo,
  PageSizeOption,
  PartialSettings,
  QuickSelectSettings,
  RetentionOption,
  SpecialItem,
  SpecialItemKey,
  SpecialItemsSettings,
} from '@shared/settings'
import { DEFAULT_SPECIAL_ITEMS, SPECIAL_ITEM_KEYS } from '@shared/settings'
import {
  completeOnboardingInCache,
  getCache,
  setSettingsInCache,
} from './store-cache'

export type {
  AppSettings,
  BringApiCredentials,
  CompanyInfo,
  PageSizeOption,
  PartialSettings,
  QuickSelectSettings,
  RetentionOption,
  SpecialItem,
  SpecialItemKey,
  SpecialItemsSettings,
}
export { DEFAULT_SPECIAL_ITEMS, SPECIAL_ITEM_KEYS }

export function getStoredSettings(): AppSettings {
  return getCache().settings
}

export function updateSettings(partial: PartialSettings): void {
  setSettingsInCache(partial)
}

export function getSpecialItem(key: SpecialItemKey): SpecialItem {
  return getStoredSettings().specialItems[key]
}

export function resetSpecialItems(): void {
  setSettingsInCache({ specialItems: DEFAULT_SPECIAL_ITEMS })
}

export function getOnboardingCompleted(): boolean {
  return getCache().onboardingCompleted
}

export function completeOnboarding(): void {
  completeOnboardingInCache()
}

export function getRetentionMs(): number {
  const { archiveRetention } = getStoredSettings()
  if (archiveRetention === 'never') return Number.MAX_SAFE_INTEGER
  return archiveRetention * 24 * 60 * 60 * 1000
}
