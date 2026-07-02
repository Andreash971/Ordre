import { ipcMain } from 'electron'
import * as z from 'zod'

import type { StoredOrder } from '../../shared/orders'
import { storedOrderSchema } from '../../shared/orders'
import {
  mergeSettings,
  migrateSettings,
  partialSettingsSchema,
  themeSchema,
} from '../../shared/settings'
import { getStore } from '../store'

const ordersSchema = z.record(z.string(), storedOrderSchema)

export function registerStoreHandlers() {
  ipcMain.handle('store:getAll', async () => {
    const store = await getStore()
    return {
      theme: store.get('theme'),
      settings: store.get('settings'),
      orders: store.get('orders'),
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
    // migrateSettings normalizes data persisted by older app versions.
    const current = migrateSettings(store.get('settings'))
    const next = mergeSettings(current, partial)
    store.set('settings', next)
    return next
  })

  ipcMain.handle('store:setOrders', async (_e, raw: unknown) => {
    const orders = ordersSchema.parse(raw) as Record<string, StoredOrder>
    const store = await getStore()
    store.set('orders', orders)
  })

  ipcMain.handle('store:clearOrders', async () => {
    const store = await getStore()
    store.set('orders', {})
  })
}
