/**
 * Customer IPC contract: input validation schema and row types shared by the
 * electron main process and the renderer.
 */
import * as z from 'zod'

export const customerIdSchema = z.number().int().positive()

export const customerSchema = z.object({
  id: customerIdSchema.optional(),
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  company: z.string().max(50).optional(),
  address: z.string().max(50).optional(),
  postcode: z.string().max(4).optional(),
  city: z.string().max(25).optional(),
  careof: z.string().max(50).optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type InsertCustomerInput = Omit<CustomerInput, 'id'>
export type UpdateCustomerInput = CustomerInput & { id: number }

/** Row shape returned by the customers IPC domain. */
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
