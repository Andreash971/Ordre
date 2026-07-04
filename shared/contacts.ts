/**
 * Contact (business representative) IPC contract: input validation schema and
 * row types shared by the electron main process and the renderer.
 */
import * as z from 'zod'

import { customerIdSchema } from './customers'
import type { Customer } from './customers'

export const contactIdSchema = z.number().int().positive()

export const contactSchema = z.object({
  id: contactIdSchema.optional(),
  customerId: customerIdSchema,
  name: z.string().max(50),
  phone: z.string().max(15).optional(),
  careof: z.string().max(50).optional(),
})

export const contactSearchSchema = z.object({
  customerId: customerIdSchema,
  query: z.string(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type InsertContactInput = Omit<ContactInput, 'id'>
export type UpdateContactInput = ContactInput & { id: number }
export type ContactSearchInput = z.infer<typeof contactSearchSchema>

/** Row shape returned by the contacts IPC domain. */
export type Contact = {
  id: number
  customerId: number
  name: string
  phone: string | null
  careof: string | null
}

export type ContactSuggestion = Contact

/**
 * A contact joined with its company row, for searching representatives
 * across all companies (e.g. "find the firm via the person you know").
 */
export type ContactWithCompany = Contact & {
  company: Customer
}
