import { pgTable, serial, varchar, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 50 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
});

export const productsDummy = pgTable("products_dummy", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 50 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
});

export const customersDummy = pgTable("customers_dummy", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	phone: varchar({ length: 15 }),
	business: varchar({ length: 50 }),
	address: varchar({ length: 50 }),
	postcode: varchar({ length: 4 }),
	city: varchar({ length: 30 }),
	careof: varchar({ length: 50 }),
});

export const customers = pgTable("customers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	phone: varchar({ length: 15 }),
	business: varchar({ length: 50 }),
	address: varchar({ length: 50 }),
	postcode: varchar({ length: 4 }),
	city: varchar({ length: 30 }),
	careof: varchar({ length: 50 }),
});
