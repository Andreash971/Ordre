import type { AppSettings, PartialSettings, ThemeMode } from '@shared/settings'
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  migrateSettings,
  themeSchema,
} from '@shared/settings'

export type StoreSnapshot = {
  theme: ThemeMode
  settings: AppSettings
  onboardingCompleted: boolean
}

let snapshot: StoreSnapshot = {
  theme: 'auto',
  settings: DEFAULT_SETTINGS,
  onboardingCompleted: false,
}

const listeners = new Set<() => void>()

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Current immutable snapshot. Components should use the hooks in
 * store-hooks.ts instead; this is for imperative code paths (PDF building,
 * event handlers).
 */
export function getCache(): StoreSnapshot {
  return snapshot
}

function update(patch: Partial<StoreSnapshot>): void {
  snapshot = { ...snapshot, ...patch }
  for (const listener of listeners) listener()
}

export function setThemeInCache(mode: ThemeMode): void {
  update({ theme: mode })
  void window.electronAPI.store.setTheme(mode)
}

export function setSettingsInCache(partial: PartialSettings): void {
  update({ settings: mergeSettings(snapshot.settings, partial) })
  void window.electronAPI.store.setSettings(partial)
}

export function completeOnboardingInCache(): void {
  update({ onboardingCompleted: true })
  void window.electronAPI.store.setOnboardingCompleted(true)
}

let hydrated = false

export async function hydrateStoreCache(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const remote = await window.electronAPI.store.getAll()
  // Older app versions persisted theme names that no longer exist.
  const parsedTheme = themeSchema.safeParse(remote.theme)
  const theme = parsedTheme.success ? parsedTheme.data : 'auto'
  update({
    theme,
    // migrateSettings fills fields missing from older app versions' data.
    settings: migrateSettings(remote.settings),
    onboardingCompleted: remote.onboardingCompleted,
  })

  try {
    window.localStorage.setItem('theme', theme)
  } catch {
    // ignore
  }
}
