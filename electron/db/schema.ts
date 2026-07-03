import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import type { OrderData, OrderSource } from '../../shared/orders'

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  postcode: text('postcode'),
  city: text('city'),
  careof: text('careof'),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  description: text('description'),
})

export const orders = sqliteTable('orders', {
  // Deterministic content hash of `data`, so re-archiving an identical order
  // (e.g. "save PDF" then "print") replaces its row instead of duplicating.
  id: text('id').primaryKey(),
  savedAt: integer('saved_at').notNull(),
  // null = keep forever ("never" retention)
  expiresAt: integer('expires_at'),
  // Effective delivery date (ISO YYYY-MM-DD) for sorting/filtering without
  // re-parsing display strings.
  deliveryDate: text('delivery_date'),
  // Raw order draft (customer/sender/delivery/items) — the editable source.
  // null for rows migrated from the pre-SQLite archive, which only kept the
  // derived print data.
  source: text('source', { mode: 'json' }).$type<OrderSource | null>(),
  // Exact print snapshot; what the archive displays and re-prints.
  data: text('data', { mode: 'json' }).$type<OrderData>().notNull(),
})
