/**
 * Product IPC contract: input validation schema and row types shared by the
 * electron main process and the renderer.
 */
import * as z from 'zod'

export const productIdSchema = z.number().int().positive()

export const productSchema = z.object({
  id: productIdSchema.optional(),
  name: z.string().trim().min(1, 'Navn er påkrevd').max(100),
  category: z
    .string()
    .max(50)
    .transform((v) => (v.trim() === '' ? 'Ukategorisert' : v.trim())),
  price: z.number().positive('Pris må være større enn 0'),
  description: z.string().max(2000).optional(),
})

export type ProductInput = z.input<typeof productSchema>
export type InsertProductInput = Omit<ProductInput, 'id'>
export type UpdateProductInput = ProductInput & { id: number }

/** Row shape returned by the products IPC domain. */
export type Product = {
  id: number
  name: string
  category: string
  price: number
  description: string | null
}
