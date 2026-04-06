import { eq, ilike } from 'drizzle-orm'
import * as z from 'zod'

import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/'
import { customersDummy } from '#/db/schema'

const customerSelect = {
  id: customersDummy.id,
  name: customersDummy.name,
  phone: customersDummy.phone,
  business: customersDummy.business,
  address: customersDummy.address,
  postcode: customersDummy.postcode,
  city: customersDummy.city,
}

export const getCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.select({ name: customersDummy.name }).from(customersDummy)
  },
)

export const searchCustomers = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.name, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByPhone = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.phone, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByBusiness = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.business, `%${query}%`))
      .limit(3)
  })

export type CustomerSuggestion = Awaited<
  ReturnType<typeof searchCustomers>
>[number]

export const getAllCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db
      .select({
        id: customersDummy.id,
        name: customersDummy.name,
        phone: customersDummy.phone,
        business: customersDummy.business,
        address: customersDummy.address,
        postcode: customersDummy.postcode,
        city: customersDummy.city,
        careof: customersDummy.careof,
      })
      .from(customersDummy)
  },
)

export type Customer = Awaited<ReturnType<typeof getAllCustomers>>[number]

export const deleteCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await db.delete(customersDummy).where(eq(customersDummy.id, id))
  })

const insertCustomerSchema = z.object({
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  company: z.string().max(50).optional(),
  address: z.string().max(50).optional(),
  postcode: z.string().max(4).optional(),
  city: z.string().max(25).optional(),
  careof: z.string().max(50).optional(),
})

export type InsertCustomerInput = z.infer<typeof insertCustomerSchema>

const updateCustomerSchema = z.object({
  id: z.number(),
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  company: z.string().max(50).optional(),
  address: z.string().max(50).optional(),
  postcode: z.string().max(4).optional(),
  city: z.string().max(25).optional(),
  careof: z.string().max(50).optional(),
})

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export const updateCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateCustomerInput) =>
    updateCustomerSchema.parse(data),
  )
  .handler(async ({ data }) => {
    await db
      .update(customersDummy)
      .set({
        name: data.name,
        phone: data.phone || null,
        business: data.company || null,
        address: data.address || null,
        postcode: data.postcode || null,
        city: data.city || null,
        careof: data.careof || null,
      })
      .where(eq(customersDummy.id, data.id))
  })

export const insertCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: InsertCustomerInput) =>
    insertCustomerSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(customersDummy)
      .values({
        name: data.name,
        phone: data.phone || null,
        business: data.company || null,
        address: data.address || null,
        postcode: data.postcode || null,
        city: data.city || null,
        careof: data.careof || null,
      })
      .returning({ id: customersDummy.id })
    return row
  })
