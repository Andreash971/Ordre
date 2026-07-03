/**
 * At-rest encryption for secrets inside the electron-store settings, using
 * the OS keychain via Electron's safeStorage (Keychain on macOS, DPAPI on
 * Windows). Encrypted values are marked with a prefix so plaintext values
 * written by older app versions keep working and get upgraded on the next
 * write (plus once at startup).
 *
 * The renderer always sends and receives plaintext over IPC; only what hits
 * disk is encrypted. Must only be called after app.whenReady().
 */
import { safeStorage } from 'electron'

import type { AppSettings } from '../shared/settings'
import { migrateSettings } from '../shared/settings'
import { getStore } from './store'

const ENC_PREFIX = 'enc:v1:'

export function encryptSecret(plain: string): string {
  if (!plain || plain.startsWith(ENC_PREFIX)) return plain
  // No OS keychain available (e.g. some Linux setups) — keep plaintext
  // rather than locking the user out of their own credentials.
  if (!safeStorage.isEncryptionAvailable()) return plain
  return ENC_PREFIX + safeStorage.encryptString(plain).toString('base64')
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(ENC_PREFIX)) return stored
  try {
    return safeStorage.decryptString(
      Buffer.from(stored.slice(ENC_PREFIX.length), 'base64'),
    )
  } catch {
    // Different OS user/keychain or corrupted value — treat as unset so the
    // user can simply re-enter the key in settings.
    return ''
  }
}

/** Settings as they should be persisted: secrets encrypted. */
export function withEncryptedSecrets(settings: AppSettings): AppSettings {
  return {
    ...settings,
    bringApi: {
      ...settings.bringApi,
      apiKey: encryptSecret(settings.bringApi.apiKey),
    },
  }
}

/** Settings as the renderer and API clients consume them: secrets plaintext. */
export function withDecryptedSecrets(settings: AppSettings): AppSettings {
  return {
    ...settings,
    bringApi: {
      ...settings.bringApi,
      apiKey: decryptSecret(settings.bringApi.apiKey),
    },
  }
}

/**
 * One-time upgrade at startup: encrypt any secrets an older app version
 * persisted in plaintext.
 */
export async function encryptStoredSecretsAtRest(): Promise<void> {
  const store = await getStore()
  const settings = migrateSettings(store.get('settings'))
  const encrypted = withEncryptedSecrets(settings)
  if (encrypted.bringApi.apiKey !== settings.bringApi.apiKey) {
    store.set('settings', encrypted)
  }
}
