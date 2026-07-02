import { ipcMain } from 'electron'
import { eq, like, sql } from 'drizzle-orm'

import { customerIdSchema, customerSchema } from '../../shared/customers'
import { getDb, schema } from '../db'

const { customers } = schema

const customerSelect = {
  id: customers.id,
  name: customers.name,
  phone: customers.phone,
  company: customers.company,
  address: customers.address,
  postcode: customers.postcode,
  city: customers.city,
  careof: customers.careof,
}

function ilikePattern(query: string) {
  return `%${query.toLowerCase()}%`
}

export function registerCustomerHandlers() {
  const db = getDb()

  ipcMain.handle('customers:getAll', async () => {
    return db.select(customerSelect).from(customers)
  })

  ipcMain.handle('customers:search', async (_e, query: string) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(like(sql`LOWER(${customers.name})`, ilikePattern(query)))
      .limit(3)
  })

  ipcMain.handle('customers:searchByPhone', async (_e, query: string) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(like(sql`LOWER(${customers.phone})`, ilikePattern(query)))
      .limit(3)
  })

  ipcMain.handle('customers:searchByBusiness', async (_e, query: string) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(like(sql`LOWER(${customers.company})`, ilikePattern(query)))
      .limit(3)
  })

  ipcMain.handle('customers:delete', async (_e, raw: unknown) => {
    const id = customerIdSchema.parse(raw)
    await db.delete(customers).where(eq(customers.id, id))
  })

  ipcMain.handle('customers:insert', async (_e, raw: unknown) => {
    const data = customerSchema.parse(raw)
    const [row] = await db
      .insert(customers)
      .values({
        name: data.name,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        postcode: data.postcode || null,
        city: data.city || null,
        careof: data.careof || null,
      })
      .returning({ id: customers.id })
    return row
  })

  ipcMain.handle('customers:update', async (_e, raw: unknown) => {
    const data = customerSchema.parse(raw)
    if (data.id === undefined) throw new Error('id required for update')
    await db
      .update(customers)
      .set({
        name: data.name,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        postcode: data.postcode || null,
        city: data.city || null,
        careof: data.careof || null,
      })
      .where(eq(customers.id, data.id))
  })
}
