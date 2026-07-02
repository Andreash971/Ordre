import type { ThemeMode } from '@shared/settings'
import { themeSchema } from '@shared/settings'
import { getCache, setThemeInCache } from './store-cache'

export type { ThemeMode }

interface ThemeDefinition {
  value: ThemeMode
  label: string
  group: string | null
  className:
    | 'light'
    | 'dark'
    | 'midnight'
    | 'editorial-florist'
    | 'ironstone'
    | null
  colorScheme: 'light' | 'dark'
}

export const THEMES = [
  {
    value: 'auto',
    label: 'Auto',
    group: null,
    className: null,
    colorScheme: 'light',
  },
  {
    value: 'light',
    label: 'Hvit',
    group: 'Lys',
    className: 'light',
    colorScheme: 'light',
  },
  {
    value: 'editorial-florist',
    label: 'Notatbok',
    group: 'Lys',
    className: 'editorial-florist',
    colorScheme: 'light',
  },
  {
    value: 'dark',
    label: 'Sort',
    group: 'Mørk',
    className: 'dark',
    colorScheme: 'dark',
  },
  {
    value: 'midnight',
    label: 'Midnatt',
    group: 'Mørk',
    className: 'midnight',
    colorScheme: 'dark',
  },
  {
    value: 'ironstone',
    label: 'Jernsten',
    group: 'Mørk',
    className: 'ironstone',
    colorScheme: 'dark',
  },
] as const satisfies ReadonlyArray<ThemeDefinition>

// Compile-time drift guard: fails to compile if THEMES is missing a value
// from the shared themeSchema (or vice versa via ThemeDefinition above).
type AssertNever<T extends never> = T
export type _ThemesCoverAllModes = AssertNever<
  Exclude<ThemeMode, (typeof THEMES)[number]['value']>
>

const LOCALSTORAGE_KEY = 'theme'

export function isThemeMode(v: unknown): v is ThemeMode {
  return themeSchema.safeParse(v).success
}

function resolve(mode: ThemeMode): ThemeDefinition {
  const direct = mode === 'auto' ? null : THEMES.find((t) => t.value === mode)
  if (direct) return direct
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return THEMES.find((t) => t.value === (prefersDark ? 'dark' : 'light'))!
}

export function applyTheme(mode: ThemeMode): void {
  const resolved = resolve(mode)
  const root = document.documentElement
  for (const t of THEMES) if (t.className) root.classList.remove(t.className)
  if (resolved.className) root.classList.add(resolved.className)
  root.setAttribute('data-theme', resolved.colorScheme)
  root.style.colorScheme = resolved.colorScheme
}

export function initTheme(): void {
  try {
    const stored = window.localStorage.getItem(LOCALSTORAGE_KEY)
    applyTheme(isThemeMode(stored) ? stored : 'auto')
  } catch {
    applyTheme('auto')
  }
}

export function getStoredTheme(): ThemeMode {
  const stored = getCache().theme
  return isThemeMode(stored) ? stored : 'auto'
}

export function setTheme(mode: ThemeMode): void {
  applyTheme(mode)
  setThemeInCache(mode)
  try {
    window.localStorage.setItem(LOCALSTORAGE_KEY, mode)
  } catch {
    // ignore
  }
}
