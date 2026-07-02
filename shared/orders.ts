/**
 * Stored-order contract shared by the electron main process and the renderer.
 */
import * as z from 'zod'

/**
 * Data rendered onto an order slip PDF. This is currently also what gets
 * archived; the PDF parsing schema in src/components/pdf/order.tsx must
 * accept every value of this type.
 */
export type OrderData = {
  company: {
    name: string
    displayName: string
    address: string
    postCode: string
    phone: string
  }
  delivery: {
    dayText: string
    longDate: string
    shortDate: string
    deliveryTime: string
    deliveryLeaveDoor: string
    deliveryLeaveNeighbour: string
  }
  sender: {
    name: string
    address: string
    postCode: string
    phone: string
    company: string
  }
  receiver: {
    name: string
    company: string
    co: string
    address: string
    postCode: string
    phone: string
  }
  card: {
    cardText: string
    instructionsText: string
  }
  orderContent: Array<{
    product: string
    description?: string
    quantity: number
    price: number
    total: number
  }>
}

export const storedOrderSchema = z.object({
  data: z.unknown(),
  savedAt: z.number(),
  expiresAt: z.number(),
  key: z.string(),
})

export type StoredOrder = {
  data: OrderData
  savedAt: number
  expiresAt: number
  key: string
}
