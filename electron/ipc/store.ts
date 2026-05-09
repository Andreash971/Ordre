import { ipcMain } from 'electron'
import * as z from 'zod'

import type { AppSettings, StoredOrder } from '../store'
import { DEFAULT_SETTINGS, getStore } from '../store'

// Source of truth: src/lib/theme.ts
const themeSchema = z.enum([
  'auto',
  'light',
  'dark',
  'gray',
  'darkblue',
  'midnight',
  'note',
  'sandstone',
  'bog',
  'ironstone',
  'darkforest',
])

const companySchema = z.object({
  name: z.string(),
  address: z.string(),
  postCode: z.string(),
  phone: z.string(),
})

const retentionSchema = z.union([
  z.literal(3),
  z.literal(7),
  z.literal(14),
  z.literal(30),
  z.literal('never'),
])

const pageSizeSchema = z.union([
  z.literal(10),
  z.literal(14),
  z.literal(25),
  z.literal(50),
])

const partialSettingsSchema = z.object({
  archiveRetention: retentionSchema.optional(),
  rowsPerPage: pageSizeSchema.optional(),
  company: companySchema.partial().optional(),
})

const storedOrderSchema = z.object({
  data: z.unknown(),
  savedAt: z.number(),
  expiresAt: z.number(),
  key: z.string(),
})

const ordersSchema = z.record(z.string(), storedOrderSchema)

export function registerStoreHandlers() {
  ipcMain.handle('store:getAll', async () => {
    const store = await getStore()
    return {
      theme: store.get('theme'),
      settings: store.get('settings'),
      orders: store.get('orders'),
    }
  })

  ipcMain.handle('store:setTheme', async (_e, raw: unknown) => {
    const mode = themeSchema.parse(raw)
    const store = await getStore()
    store.set('theme', mode)
  })

  ipcMain.handle('store:setSettings', async (_e, raw: unknown) => {
    const partial = partialSettingsSchema.parse(raw)
    const store = await getStore()
    const current = store.get('settings')
    const next: AppSettings = {
      archiveRetention:
        partial.archiveRetention ??
        current.archiveRetention ??
        DEFAULT_SETTINGS.archiveRetention,
      rowsPerPage:
        partial.rowsPerPage ??
        current.rowsPerPage ??
        DEFAULT_SETTINGS.rowsPerPage,
      company: {
        ...DEFAULT_SETTINGS.company,
        ...current.company,
        ...(partial.company ?? {}),
      },
    }
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
