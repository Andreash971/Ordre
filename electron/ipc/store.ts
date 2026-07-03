import { ipcMain } from 'electron'
import * as z from 'zod'

import {
  mergeSettings,
  migrateSettings,
  partialSettingsSchema,
  themeSchema,
} from '../../shared/settings'
import { withDecryptedSecrets, withEncryptedSecrets } from '../secure-storage'
import { getStore } from '../store'

export function registerStoreHandlers() {
  ipcMain.handle('store:getAll', async () => {
    const store = await getStore()
    return {
      theme: store.get('theme'),
      settings: withDecryptedSecrets(migrateSettings(store.get('settings'))),
      onboardingCompleted: store.get('onboardingCompleted'),
    }
  })

  ipcMain.handle('store:setOnboardingCompleted', async (_e, raw: unknown) => {
    const completed = z.boolean().parse(raw)
    const store = await getStore()
    store.set('onboardingCompleted', completed)
  })

  ipcMain.handle('store:setTheme', async (_e, raw: unknown) => {
    const mode = themeSchema.parse(raw)
    const store = await getStore()
    store.set('theme', mode)
  })

  ipcMain.handle('store:setSettings', async (_e, raw: unknown) => {
    const partial = partialSettingsSchema.parse(raw)
    const store = await getStore()
    // migrateSettings normalizes data persisted by older app versions. The
    // renderer sends secrets in plaintext; encrypt before they hit disk and
    // hand plaintext back so its settings cache stays consistent.
    const current = migrateSettings(store.get('settings'))
    const next = mergeSettings(current, partial)
    store.set('settings', withEncryptedSecrets(next))
    return withDecryptedSecrets(next)
  })
}
