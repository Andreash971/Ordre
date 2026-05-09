import { getCache, setThemeInCache } from './store-cache'

export type ThemeMode =
  | 'auto'
  | 'light'
  | 'dark'
  | 'gray'
  | 'darkblue'
  | 'midnight'
  | 'note'
  | 'sandstone'
  | 'bog'
  | 'ironstone'
  | 'darkforest'

interface ThemeDefinition {
  value: ThemeMode
  label: string
  group: string | null
  className:
    | 'light'
    | 'dark'
    | 'gray'
    | 'darkblue'
    | 'midnight'
    | 'note'
    | 'sandstone'
    | 'bog'
    | 'ironstone'
    | 'darkforest'
    | null
  colorScheme: 'light' | 'dark'
}

export const THEMES: ReadonlyArray<ThemeDefinition> = [
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
    value: 'gray',
    label: 'Grå',
    group: 'Lys',
    className: 'gray',
    colorScheme: 'light',
  },
  {
    value: 'note',
    label: 'Notatbok',
    group: 'Lys',
    className: 'note',
    colorScheme: 'dark',
  },
  {
    value: 'sandstone',
    label: 'Sandstein',
    group: 'Lys',
    className: 'sandstone',
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
    value: 'darkblue',
    label: 'Mørkeblå',
    group: 'Mørk',
    className: 'darkblue',
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
  {
    value: 'darkforest',
    label: 'Mørk Skog',
    group: 'Mørk',
    className: 'darkforest',
    colorScheme: 'dark',
  },
  {
    value: 'bog',
    label: 'Myrskog',
    group: 'Mørk',
    className: 'bog',
    colorScheme: 'dark',
  },
]

const LOCALSTORAGE_KEY = 'theme'
const THEME_VALUES = THEMES.map((t) => t.value)

export function isThemeMode(v: unknown): v is ThemeMode {
  return typeof v === 'string' && (THEME_VALUES as Array<string>).includes(v)
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
