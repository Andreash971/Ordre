import { ilike } from 'drizzle-orm'

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
