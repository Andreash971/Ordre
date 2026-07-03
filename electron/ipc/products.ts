import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'

import { productIdSchema, productSchema } from '../../shared/products'
import { containsInsensitive, getDb, schema } from '../db'

const { products } = schema

/** Autocomplete dropdowns show at most this many suggestions. */
const SEARCH_RESULT_LIMIT = 3

const productSelect = {
  id: products.id,
  name: products.name,
  category: products.category,
  price: products.price,
  description: products.description,
}

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
      .where(containsInsensitive(products.name, query))
      .limit(SEARCH_RESULT_LIMIT)
  })

  ipcMain.handle('products:delete', async (_e, raw: unknown) => {
    const id = productIdSchema.parse(raw)
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
