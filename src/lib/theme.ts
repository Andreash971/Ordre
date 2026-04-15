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
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
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
  window.localStorage.setItem('theme', mode)
}
