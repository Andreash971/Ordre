import { eq, ilike } from 'drizzle-orm'
import * as z from 'zod'

import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/'
import { customers } from '#/db/schema'

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

export const getCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.select({ name: customers.name }).from(customers)
  },
)

export const searchCustomers = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(ilike(customers.name, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByPhone = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(ilike(customers.phone, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByBusiness = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customers)
      .where(ilike(customers.company, `%${query}%`))
      .limit(3)
  })

export type CustomerSuggestion = Awaited<
  ReturnType<typeof searchCustomers>
>[number]

export const getAllCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        company: customers.company,
        address: customers.address,
        postcode: customers.postcode,
        city: customers.city,
        careof: customers.careof,
      })
      .from(customers)
  },
)

export type Customer = Awaited<ReturnType<typeof getAllCustomers>>[number]

export const deleteCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await db.delete(customers).where(eq(customers.id, id))
  })

const customerSchema = z.object({
  id: z.number().optional(),
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  company: z.string().max(50).optional(),
  address: z.string().max(50).optional(),
  postcode: z.string().max(4).optional(),
  city: z.string().max(25).optional(),
  careof: z.string().max(50).optional(),
})

export type InsertCustomerInput = Omit<z.infer<typeof customerSchema>, 'id'>
export type UpdateCustomerInput = z.infer<typeof customerSchema> & {
  id: number
}

export const updateCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateCustomerInput) => customerSchema.parse(data))
  .handler(async ({ data }) => {
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
      .where(eq(customers.id, data.id!))
  })

export const insertCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: InsertCustomerInput) => customerSchema.parse(data))
  .handler(async ({ data }) => {
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
