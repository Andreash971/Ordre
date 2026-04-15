import { pgTable, serial, varchar, numeric } from 'drizzle-orm/pg-core'

export const customers = pgTable('customers', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 50 }).notNull(),
  phone: varchar({ length: 15 }),
  company: varchar({ length: 50 }),
  address: varchar({ length: 50 }),
  postcode: varchar({ length: 4 }),
  city: varchar({ length: 30 }),
  careof: varchar({ length: 50 }),
})

export const products = pgTable('products', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  category: varchar({ length: 50 }).notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
})
