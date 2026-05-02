import { getCache, setThemeInCache } from './store-cache'

export type ThemeMode = 'auto' | 'light' | 'dark'

export interface ThemeOption {
  value: ThemeMode
  label: string
  group: string | null
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'auto', label: 'Auto', group: null },
  { value: 'light', label: 'Lys - Hvit', group: 'Lys' },
  { value: 'dark', label: 'Mørk - Sort', group: 'Mørk' },
]

export function getStoredTheme(): ThemeMode {
  return getCache().theme
}

export function applyTheme(mode: ThemeMode): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export function setTheme(mode: ThemeMode): void {
  applyTheme(mode)
  setThemeInCache(mode)
}
