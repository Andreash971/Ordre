import { ipcMain } from 'electron'
import { and, eq } from 'drizzle-orm'
import * as z from 'zod'

import {
  contactIdSchema,
  contactSchema,
  contactSearchSchema,
} from '../../shared/contacts'
import { customerIdSchema } from '../../shared/customers'
import { containsInsensitive, getDb, schema } from '../db'

const { contacts, customers } = schema

/** Autocomplete dropdowns show at most this many suggestions. */
const SEARCH_RESULT_LIMIT = 3

export function registerContactHandlers() {
  const db = getDb()

  ipcMain.handle('contacts:getAll', async () => {
    return db.select().from(contacts)
  })

  ipcMain.handle('contacts:getByCompany', async (_e, raw: unknown) => {
    const customerId = customerIdSchema.parse(raw)
    return db.select().from(contacts).where(eq(contacts.customerId, customerId))
  })

  // Company-scoped. An empty query lists every representative of the company,
  // so the order form can offer them as a plain dropdown; companies have few
  // representatives, so no limit.
  ipcMain.handle('contacts:search', async (_e, raw: unknown) => {
    const { customerId, query } = contactSearchSchema.parse(raw)
    const scope = eq(contacts.customerId, customerId)
    return db
      .select()
      .from(contacts)
      .where(
        query ? and(scope, containsInsensitive(contacts.name, query)) : scope,
      )
  })

  // Across all companies: find the firm via a representative you know.
  ipcMain.handle('contacts:searchAll', async (_e, raw: unknown) => {
    const query = z.string().parse(raw)
    if (!query) return []
    const rows = await db
      .select({ contact: contacts, company: customers })
      .from(contacts)
      .innerJoin(customers, eq(contacts.customerId, customers.id))
      .where(containsInsensitive(contacts.name, query))
      .limit(SEARCH_RESULT_LIMIT)
    return rows.map(({ contact, company }) => ({ ...contact, company }))
  })

  ipcMain.handle('contacts:insert', async (_e, raw: unknown) => {
    const data = contactSchema.parse(raw)
    const [row] = await db
      .insert(contacts)
      .values({
        customerId: data.customerId,
        name: data.name,
        phone: data.phone || null,
        careof: data.careof || null,
      })
      .returning({ id: contacts.id })
    return row
  })

  ipcMain.handle('contacts:update', async (_e, raw: unknown) => {
    const data = contactSchema.parse(raw)
    if (data.id === undefined) throw new Error('id required for update')
    await db
      .update(contacts)
      .set({
        name: data.name,
        phone: data.phone || null,
        careof: data.careof || null,
      })
      .where(eq(contacts.id, data.id))
  })

  ipcMain.handle('contacts:delete', async (_e, raw: unknown) => {
    const id = contactIdSchema.parse(raw)
    await db.delete(contacts).where(eq(contacts.id, id))
  })
}
