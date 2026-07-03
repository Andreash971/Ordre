/**
 * Order contracts shared by the electron main process and the renderer:
 * the raw order draft (source), the derived print data, and the archived
 * order row shape.
 */
import * as z from 'zod'
import type { SpecialItemKey } from './settings'

// ---------------------------------------------------------------------------
// Order source (raw draft) — what the user actually entered
// ---------------------------------------------------------------------------

export type CustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  careof: string
}

export type DeliveryValues = {
  date: string
  time: string | null
  leaveDoor: boolean
  leaveNeighbour: boolean
}

/** One recipient: customer fields plus per-recipient delivery overrides. */
export type OrderRecipient = CustomerFormValues & {
  cardmsg: string
  instructmsg: string
  date: string
  time: string | null
  leaveDoor: boolean
  leaveNeighbour: boolean
}

export type OrderItem = {
  productId?: number
  specialKey?: SpecialItemKey
  name: string
  description: string
  category?: string
  price: number
  quantity: number
  originalName?: string
  originalDescription?: string
  originalPrice?: number
}

/** The raw draft an archived order was generated from. */
export type OrderSource = {
  customer: OrderRecipient
  sender: CustomerFormValues | null
  delivery: DeliveryValues
  items: OrderItem[]
}

// ---------------------------------------------------------------------------
// Derived print data
// ---------------------------------------------------------------------------

/**
 * Data rendered onto an order slip PDF. The PDF parsing schema in
 * src/components/pdf/order.tsx must accept every value of this type.
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

// ---------------------------------------------------------------------------
// Archived orders (SQLite-backed)
// ---------------------------------------------------------------------------

/** Payload for archiving one order slip. */
export type NewArchivedOrder = {
  source: OrderSource
  data: OrderData
}

/** Row shape returned by the orders IPC domain. */
export type ArchivedOrder = {
  id: string
  savedAt: number
  /** null = keep forever */
  expiresAt: number | null
  /** Effective delivery date (ISO YYYY-MM-DD), for sorting/filtering. */
  deliveryDate: string | null
  /** null for rows migrated from the pre-SQLite archive. */
  source: OrderSource | null
  data: OrderData
}

// The inner payloads are large nested structures typed via TS on both ends;
// IPC validation checks the envelope (parity with the previous store-based
// archive, which validated the same way).
export const newArchivedOrdersSchema = z.array(
  z.object({ source: z.unknown(), data: z.unknown() }),
)

// ---------------------------------------------------------------------------
// Legacy electron-store archive blob (pre-SQLite). Used only by the one-time
// startup migration. Remove once ordersBackup is dropped (on or after
// 2026-10-01).
// ---------------------------------------------------------------------------

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
