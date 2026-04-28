import * as z from 'zod'

export type Customer = {
  id: number
  name: string
  phone: string | null
  company: string | null
  address: string | null
  postcode: string | null
  city: string | null
  careof: string | null
}

export type CustomerSuggestion = Customer

export type Product = {
  id: number
  name: string
  category: string
  price: number
}

export type AddressSuggestion = {
  id: number
  street_name: string
  house_number: number | null
  letter: string | null
  postal_code: string
  city: string
  municipality: string | null
}

export const customerSchema = z.object({
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

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Navn er påkrevd').max(100),
  category: z.string().max(50),
  price: z.number(),
})
export type InsertProductInput = Omit<z.infer<typeof productSchema>, 'id'>
export type UpdateProductInput = z.infer<typeof productSchema> & { id: number }
