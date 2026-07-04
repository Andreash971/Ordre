/**
 * Customer IPC contract: input validation schema and row types shared by the
 * electron main process and the renderer.
 */
import * as z from 'zod'

export const customerIdSchema = z.number().int().positive()

/**
 * 'private': the row is a person; `name` is primary and `company` is their
 * employer. 'business': the row is the company; `company` is primary, `name`
 * mirrors it, and representatives live in the contacts domain.
 */
export const customerTypeSchema = z.enum(['private', 'business'])
export type CustomerType = z.infer<typeof customerTypeSchema>

export const customerSchema = z.object({
  id: customerIdSchema.optional(),
  type: customerTypeSchema.default('private'),
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  company: z.string().max(50).optional(),
  address: z.string().max(50).optional(),
  postcode: z.string().max(4).optional(),
  city: z.string().max(25).optional(),
  careof: z.string().max(50).optional(),
})

export const customerSearchSchema = z.object({
  query: z.string(),
  type: customerTypeSchema,
})

export type CustomerInput = z.infer<typeof customerSchema>
export type InsertCustomerInput = Omit<CustomerInput, 'id'>
export type UpdateCustomerInput = CustomerInput & { id: number }

/** Row shape returned by the customers IPC domain. */
export type Customer = {
  id: number
  type: CustomerType
  name: string
  phone: string | null
  company: string | null
  address: string | null
  postcode: string | null
  city: string | null
  careof: string | null
}

export type CustomerSuggestion = Customer

/**
 * What a customer form has resolved to: which saved rows a save should
 * target. For business customers `customerId` is the company row and
 * `contactId` the chosen representative; for private, `contactId` is null.
 */
export type CustomerSelection = {
  type: CustomerType
  customerId: number | null
  contactId: number | null
}

export const EMPTY_SELECTION: CustomerSelection = {
  type: 'private',
  customerId: null,
  contactId: null,
}
