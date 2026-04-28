import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'

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
})
