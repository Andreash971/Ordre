import { getCache, setSettingsInCache } from './store-cache'

export type RetentionOption = 3 | 7 | 14 | 30 | 'never'
export type PageSizeOption = 10 | 14 | 25 | 50

export type CompanyInfo = {
  name: string
  address: string
  postCode: string
  phone: string
}

export type AppSettings = {
  archiveRetention: RetentionOption
  rowsPerPage: PageSizeOption
  company: CompanyInfo
}

export function getStoredSettings(): AppSettings {
  return getCache().settings
}

export function updateSettings(partial: Partial<AppSettings>): void {
  setSettingsInCache(partial)
}

export function getRetentionMs(): number {
  const { archiveRetention } = getStoredSettings()
  if (archiveRetention === 'never') return Number.MAX_SAFE_INTEGER
  return archiveRetention * 24 * 60 * 60 * 1000
}
