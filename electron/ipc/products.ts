import { ipcMain } from 'electron'
import { eq, like, sql } from 'drizzle-orm'
import * as z from 'zod'

import { getDb, schema } from '../db'

const { products } = schema

const productSelect = {
  id: products.id,
  name: products.name,
  category: products.category,
  price: products.price,
  description: products.description,
}

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().trim().min(1, 'Navn er påkrevd').max(100),
  category: z
    .string()
    .max(50)
    .transform((v) => (v.trim() === '' ? 'Ukategorisert' : v.trim())),
  price: z.number().positive('Pris må være større enn 0'),
  description: z.string().max(2000).optional(),
})

export function registerProductHandlers() {
  const db = getDb()

  ipcMain.handle('products:getAll', async () => {
    return db.select(productSelect).from(products)
  })

  ipcMain.handle('products:search', async (_e, query: string) => {
    if (!query || query.length < 1) return []
    return db
      .select(productSelect)
      .from(products)
      .where(like(sql`LOWER(${products.name})`, `%${query.toLowerCase()}%`))
      .limit(3)
  })

  ipcMain.handle('products:delete', async (_e, raw: unknown) => {
    const id = z.number().int().positive().parse(raw)
    await db.delete(products).where(eq(products.id, id))
  })

  ipcMain.handle('products:insert', async (_e, raw: unknown) => {
    const data = productSchema.parse(raw)
    const [row] = await db
      .insert(products)
      .values({
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description ?? '',
      })
      .returning(productSelect)
    return row
  })

  ipcMain.handle('products:update', async (_e, raw: unknown) => {
    const data = productSchema.parse(raw)
    if (data.id === undefined) throw new Error('id required for update')
    await db
      .update(products)
      .set({
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description ?? '',
      })
      .where(eq(products.id, data.id))
  })
}
