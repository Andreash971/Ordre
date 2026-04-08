import { eq } from 'drizzle-orm'
import * as z from 'zod'

import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/'
import { productsDummy } from '#/db/schema'

export const getAllProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db
      .select({
        id: productsDummy.id,
        name: productsDummy.name,
        category: productsDummy.category,
        price: productsDummy.price,
      })
      .from(productsDummy)
  },
)

export type Product = Awaited<ReturnType<typeof getAllProducts>>[number]

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await db.delete(productsDummy).where(eq(productsDummy.id, id))
  })

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Navn er påkrevd').max(100),
  category: z.string().max(50).optional(),
  price: z.number(),
})

export type InsertProductInput = Omit<z.infer<typeof productSchema>, 'id'>
export type UpdateProductInput = z.infer<typeof productSchema> & { id: number }

export const insertProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: InsertProductInput) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(productsDummy)
      .values({
        name: data.name,
        category: data.category || null,
        price: String(data.price),
      })
      .returning({ id: productsDummy.id, price: productsDummy.price })
    return row
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateProductInput) => productSchema.parse(data))
  .handler(async ({ data }) => {
    await db
      .update(productsDummy)
      .set({
        name: data.name,
        category: data.category || null,
        price: String(data.price),
      })
      .where(eq(productsDummy.id, data.id!))
  })
