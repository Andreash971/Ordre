/**
 * Review status for archived orders: which crucial fields are missing
 * before an order slip can be printed without a manual check.
 */
import type { ArchivedOrder } from '@shared/orders'

export type MissingField = 'telefon' | 'adresse'

/** Crucial fields missing from an archived order, as Norwegian labels. */
export function orderMissingFields(order: ArchivedOrder): MissingField[] {
  const { receiver } = order.data
  const missing: MissingField[] = []
  if (!receiver.phone.trim()) missing.push('telefon')
  if (!receiver.address.trim() || !receiver.postCode.trim())
    missing.push('adresse')
  return missing
}

export function orderNeedsReview(order: ArchivedOrder): boolean {
  return orderMissingFields(order).length > 0
}

/** Join labels into a Norwegian sentence fragment: "telefon og adresse". */
export function listMissingFields(fields: string[]): string {
  if (fields.length <= 1) return fields[0] ?? ''
  return `${fields.slice(0, -1).join(', ')} og ${fields[fields.length - 1]}`
}
