import { ipcMain } from 'electron'
import { and, desc, eq, isNotNull, lt } from 'drizzle-orm'
import * as z from 'zod'

import type {
  NewArchivedOrder,
  OrderData,
  OrderSource,
  StoredOrder,
} from '../../shared/orders'
import { newArchivedOrdersSchema } from '../../shared/orders'
import type { RetentionOption } from '../../shared/settings'
import { getDb, schema } from '../db'
import { getStore } from '../store'

const { orders } = schema

/**
 * Deterministic id derived from the print data. Re-archiving an identical
 * order (e.g. "save PDF" followed by "print") replaces its row instead of
 * duplicating it, while orders that differ in any field never collide.
 */
function orderId(data: OrderData): string {
  const json = JSON.stringify(data)
  let hash = 5381
  for (let i = 0; i < json.length; i++) {
    hash = (((hash << 5) + hash) ^ json.charCodeAt(i)) >>> 0
  }
  return `ordre-${hash.toString(36)}-${json.length.toString(36)}`
}

function retentionToExpiresAt(
  retention: RetentionOption,
  savedAt: number,
): number | null {
  if (retention === 'never') return null
  return savedAt + retention * 24 * 60 * 60 * 1000
}

/** Parse the display date "DD.MM.YYYY" back to ISO. Legacy rows only. */
function shortDateToIso(short: string): string | null {
  const parts = short.split('.')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  if (!d || !m || !y) return null
  return `${y}-${m}-${d}`
}

export function registerOrderHandlers() {
  const db = getDb()

  ipcMain.handle('orders:getAll', async () => {
    return db.select().from(orders).orderBy(desc(orders.savedAt))
  })

  ipcMain.handle('orders:insert', async (_e, raw: unknown) => {
    const payloads = newArchivedOrdersSchema.parse(
      raw,
    ) as Array<NewArchivedOrder>
    const store = await getStore()
    const retention = store.get('settings').archiveRetention
    const now = Date.now()

    for (const payload of payloads) {
      const effectiveDate =
        payload.source.customer.date || payload.source.delivery.date || null
      await db
        .insert(orders)
        .values({
          id: orderId(payload.data),
          savedAt: now,
          expiresAt: retentionToExpiresAt(retention, now),
          deliveryDate: effectiveDate,
          source: payload.source,
          data: payload.data,
        })
        .onConflictDoUpdate({
          target: orders.id,
          set: {
            savedAt: now,
            expiresAt: retentionToExpiresAt(retention, now),
            deliveryDate: effectiveDate,
            source: payload.source,
            data: payload.data,
          },
        })
    }
  })

  ipcMain.handle('orders:delete', async (_e, raw: unknown) => {
    const id = z.string().min(1).parse(raw)
    await db.delete(orders).where(eq(orders.id, id))
  })

  ipcMain.handle('orders:clear', async () => {
    await db.delete(orders)
  })

  ipcMain.handle('orders:pruneExpired', async () => {
    await pruneExpiredOrders()
  })
}

export async function pruneExpiredOrders(): Promise<void> {
  const db = getDb()
  await db
    .delete(orders)
    .where(and(isNotNull(orders.expiresAt), lt(orders.expiresAt, Date.now())))
}

/**
 * One-time migration of the pre-SQLite archive (electron-store `orders`
 * blob) into the orders table. The blob is kept under `ordersBackup` for one
 * release as a safety net — drop it (and this function) on or after
 * 2026-10-01.
 */
export async function migrateLegacyOrders(): Promise<void> {
  const store = await getStore()
  const legacy = store.get('orders')
  const entries = Object.values(legacy)
  if (entries.length === 0) return

  const db = getDb()
  for (const entry of entries) {
    const data = entry.data as Partial<OrderData> | undefined
    if (!data || typeof entry.savedAt !== 'number') continue
    const shortDate = data.delivery?.shortDate
    await db
      .insert(orders)
      .values({
        id: entry.key || orderId(data as OrderData),
        savedAt: entry.savedAt,
        // "never" retention was stored as savedAt + MAX_SAFE_INTEGER-ish
        // timestamps; anything implausibly far out means "keep forever".
        expiresAt: entry.expiresAt > 4102444800000 ? null : entry.expiresAt,
        deliveryDate: shortDate ? shortDateToIso(shortDate) : null,
        source: null as OrderSource | null,
        data: data as OrderData,
      })
      .onConflictDoNothing()
  }

  store.set('ordersBackup', legacy)
  store.set('orders', {})
}
