import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const customersDummy = pgTable('customers_dummy', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 50 }).notNull(),
  phone: varchar({ length: 15 }),
  business: varchar({ length: 50 }),
  address: varchar({ length: 50 }),
  postcode: varchar({ length: 4 }),
  city: varchar({ length: 30 }),
  careof: varchar({ length: 50 }),
})
