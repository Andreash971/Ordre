import type { Decorator, Preview } from '@storybook/react-vite'
import { DecoratorHelpers } from '@storybook/addon-themes'
import { useEffect } from 'storybook/preview-api'
import '../src/styles.css'

// Mirrors the app's five themes and how applyTheme() in src/lib/theme.ts
// applies them: a theme class plus data-theme=<light|dark> on <html>.
const APP_THEMES = {
  'Hvit (lys)': { className: 'light', colorScheme: 'light' },
  'Notatbok (lys)': { className: 'editorial-florist', colorScheme: 'light' },
  'Sort (mørk)': { className: 'dark', colorScheme: 'dark' },
  'Midnatt (mørk)': { className: 'midnight', colorScheme: 'dark' },
  'Jernsten (mørk)': { className: 'ironstone', colorScheme: 'dark' },
} as const

type AppThemeName = keyof typeof APP_THEMES

const DEFAULT_THEME: AppThemeName = 'Hvit (lys)'
const ALL_CLASSES = Object.values(APP_THEMES).map((t) => t.className)

const { initializeThemeState, pluckThemeFromContext } = DecoratorHelpers

const withAppTheme: Decorator = (storyFn, context) => {
  const themeName = (pluckThemeFromContext(context) ||
    DEFAULT_THEME) as AppThemeName
  const { className, colorScheme } =
    APP_THEMES[themeName] ?? APP_THEMES[DEFAULT_THEME]

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(...ALL_CLASSES)
    root.classList.add(className)
    root.setAttribute('data-theme', colorScheme)
    root.style.colorScheme = colorScheme
  }, [className, colorScheme])

  return storyFn()
}

initializeThemeState(Object.keys(APP_THEMES), DEFAULT_THEME)

const preview: Preview = {
  decorators: [withAppTheme],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    a11y: {
      test: 'todo',
    },
  },
  tags: ['autodocs'],
}

export default preview
