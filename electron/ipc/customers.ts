import { ipcMain } from 'electron'
import { and, eq } from 'drizzle-orm'

import {
  customerIdSchema,
  customerSchema,
  customerSearchSchema,
} from '../../shared/customers'
import type { CustomerInput } from '../../shared/customers'
import { containsInsensitive, getDb, schema } from '../db'

const { customers } = schema

/** Autocomplete dropdowns show at most this many suggestions. */
const SEARCH_RESULT_LIMIT = 3

const customerSelect = {
  id: customers.id,
  type: customers.type,
  name: customers.name,
  phone: customers.phone,
  company: customers.company,
  address: customers.address,
  postcode: customers.postcode,
  city: customers.city,
  careof: customers.careof,
}

/**
 * Column values for an insert/update. A business row *is* the company, so its
 * `name` mirrors the company name — that keeps the NOT NULL invariant and
 * generic name search working; the representative is never the company row.
 */
function customerValues(data: CustomerInput) {
  const name = data.type === 'business' ? data.company || '' : data.name
  return {
    type: data.type,
    name,
    phone: data.phone || null,
    company: data.company || null,
    address: data.address || null,
    postcode: data.postcode || null,
    city: data.city || null,
    careof: data.careof || null,
  }
}

export function registerCustomerHandlers() {
  const db = getDb()

  ipcMain.handle('customers:getAll', async () => {
    return db.select(customerSelect).from(customers)
  })

  ipcMain.handle('customers:search', async (_e, raw: unknown) => {
    const { query, type } = customerSearchSchema.parse(raw)
    if (!query) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(
        and(
          eq(customers.type, type),
          containsInsensitive(customers.name, query),
        ),
      )
      .limit(SEARCH_RESULT_LIMIT)
  })

  ipcMain.handle('customers:searchByPhone', async (_e, raw: unknown) => {
    const { query, type } = customerSearchSchema.parse(raw)
    if (!query) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(
        and(
          eq(customers.type, type),
          containsInsensitive(customers.phone, query),
        ),
      )
      .limit(SEARCH_RESULT_LIMIT)
  })

  ipcMain.handle('customers:searchByBusiness', async (_e, raw: unknown) => {
    const { query, type } = customerSearchSchema.parse(raw)
    if (!query) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(
        and(
          eq(customers.type, type),
          containsInsensitive(customers.company, query),
        ),
      )
      .limit(SEARCH_RESULT_LIMIT)
  })

  ipcMain.handle('customers:delete', async (_e, raw: unknown) => {
    const id = customerIdSchema.parse(raw)
    await db.delete(customers).where(eq(customers.id, id))
  })

  ipcMain.handle('customers:insert', async (_e, raw: unknown) => {
    const data = customerSchema.parse(raw)
    const [row] = await db
      .insert(customers)
      .values(customerValues(data))
      .returning({ id: customers.id })
    return row
  })

  ipcMain.handle('customers:update', async (_e, raw: unknown) => {
    const data = customerSchema.parse(raw)
    if (data.id === undefined) throw new Error('id required for update')
    await db
      .update(customers)
      .set(customerValues(data))
      .where(eq(customers.id, data.id))
  })
}
