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

const SETTINGS_KEY = 'app_settings'

const DEFAULT_SETTINGS: AppSettings = {
  archiveRetention: 7,
  rowsPerPage: 14,
  company: { name: '', address: '', postCode: '', phone: '' },
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      archiveRetention: parsed.archiveRetention ?? DEFAULT_SETTINGS.archiveRetention,
      rowsPerPage: parsed.rowsPerPage ?? DEFAULT_SETTINGS.rowsPerPage,
      company: { ...DEFAULT_SETTINGS.company, ...(parsed.company ?? {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function updateSettings(partial: Partial<AppSettings>): void {
  const current = getStoredSettings()
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...partial }))
}

export function getRetentionMs(): number {
  const { archiveRetention } = getStoredSettings()
  if (archiveRetention === 'never') return Number.MAX_SAFE_INTEGER
  return archiveRetention * 24 * 60 * 60 * 1000
}
