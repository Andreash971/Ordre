import { eq } from 'drizzle-orm'
import * as z from 'zod'

import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/'
import { products } from '#/db/schema'

export const getAllProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        price: products.price,
      })
      .from(products)
  },
)

export type Product = Awaited<ReturnType<typeof getAllProducts>>[number]

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await db.delete(products).where(eq(products.id, id))
  })

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Navn er påkrevd').max(100),
  category: z.string().max(50),
  price: z.number(),
})

export type InsertProductInput = Omit<z.infer<typeof productSchema>, 'id'>
export type UpdateProductInput = z.infer<typeof productSchema> & { id: number }

export const insertProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: InsertProductInput) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(products)
      .values({
        name: data.name,
        category: data.category,
        price: String(data.price),
      })
      .returning({
        id: products.id,
        category: products.category,
        price: products.price,
      })
    return row
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateProductInput) => productSchema.parse(data))
  .handler(async ({ data }) => {
    await db
      .update(products)
      .set({
        name: data.name,
        category: data.category,
        price: String(data.price),
      })
      .where(eq(products.id, data.id!))
  })
