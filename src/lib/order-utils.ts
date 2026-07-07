import type { Item } from '@/components/OrderColumns'
import type {
  ArchivedOrder,
  CustomerFormValues,
  DeliveryValues,
  NewArchivedOrder,
  OrderData,
  OrderRecipient,
  OrderSender,
} from '@shared/orders'
import { getStoredSettings } from '@/lib/settings'
import { getSpecialKeyForItem } from '@/lib/special-items'

export type { CustomerFormValues, DeliveryValues, OrderSender }
export type Customer = OrderRecipient

/**
 * Whether an archived order's receiver is a business customer
 * (company-first display, name is the representative). Only orders created
 * after the private/business split carry the selection.
 */
export function isBusinessReceiver(order: ArchivedOrder): boolean {
  return (
    order.source?.customer.selection?.type === 'business' &&
    Boolean(order.data.receiver.company)
  )
}

/** Display label for the receiver: company for businesses, else name. */
export function orderReceiverLabel(order: ArchivedOrder): string {
  const { receiver } = order.data
  return (
    (isBusinessReceiver(order) ? receiver.company : receiver.name) ||
    'Uten navn'
  )
}

/**
 * Representative line ("v/ …") for business receivers, when the contact
 * person differs from the company name. Undefined for private customers.
 */
export function orderReceiverRepresentative(
  order: ArchivedOrder,
): string | undefined {
  const { receiver } = order.data
  return isBusinessReceiver(order) &&
    receiver.name &&
    receiver.name !== receiver.company
    ? receiver.name
    : undefined
}

/**
 * Whether an archived order's sender is a business customer. Only orders
 * created after the sender selection was archived carry this; older orders
 * fall back to private display.
 */
export function isBusinessSender(order: ArchivedOrder): boolean {
  return (
    order.source?.sender?.selection?.type === 'business' &&
    Boolean(order.data.sender.company)
  )
}

/** Display label for the sender: company for businesses, else name. */
export function orderSenderLabel(order: ArchivedOrder): string {
  const { sender } = order.data
  return (isBusinessSender(order) ? sender.company : sender.name) || '—'
}

/** Representative line ("v/ …") for business senders. */
export function orderSenderRepresentative(
  order: ArchivedOrder,
): string | undefined {
  const { sender } = order.data
  return isBusinessSender(order) &&
    sender.name &&
    sender.name !== sender.company
    ? sender.name
    : undefined
}

/** Copy just the customer-form fields from any customer-shaped object. */
export function pickCustomerFormValues(
  c: CustomerFormValues,
): CustomerFormValues {
  return {
    name: c.name,
    phone: c.phone,
    company: c.company,
    address: c.address,
    postcode: c.postcode,
    city: c.city,
    careof: c.careof,
  }
}

export function formatDeliveryDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const raw = date.toLocaleDateString('nb-NO', { weekday: 'long' })
  const dayText = raw.charAt(0).toUpperCase() + raw.slice(1)
  const longDate = date.toLocaleDateString('nb-NO', { dateStyle: 'long' })
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortDate = `${day}.${month}.${date.getFullYear()}`
  const rawMonth = date.toLocaleDateString('nb-NO', { month: 'long' })
  const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1)
  const fullDate = `${dayText}, ${date.getDate()} ${monthName} ${date.getFullYear()}`
  return { dayText, longDate, shortDate, fullDate }
}

export function buildOrderData(
  customer: Customer,
  sender: OrderSender | null,
  delivery: DeliveryValues,
  items: Item[],
): OrderData {
  const { company } = getStoredSettings()
  const effectiveDate = customer.date || delivery.date
  const { dayText, longDate, shortDate } = formatDeliveryDate(effectiveDate)
  return {
    company: {
      name: company.name,
      displayName: company.displayName,
      address: company.address,
      postCode: company.postCode,
      phone: company.phone,
    },
    delivery: {
      dayText,
      longDate,
      shortDate,
      deliveryTime: customer.time ?? '',
      deliveryLeaveDoor: customer.leaveDoor ? 'Ja' : 'Nei',
      deliveryLeaveNeighbour: customer.leaveNeighbour ? 'Ja' : 'Nei',
    },
    sender: {
      name: sender?.name ?? '',
      address: sender?.address ?? '',
      postCode: sender ? `${sender.postcode} ${sender.city}`.trim() : '',
      phone: sender?.phone ?? '',
      company: sender?.company ?? '',
    },
    receiver: {
      name: customer.name,
      company: customer.company,
      co: customer.careof,
      address: customer.address,
      postCode: `${customer.postcode} ${customer.city}`.trim(),
      phone: customer.phone,
    },
    card: {
      cardText: customer.cardmsg,
      instructionsText: customer.instructmsg,
    },
    orderContent: items
      .filter(
        (i) =>
          customer.time !== null || getSpecialKeyForItem(i) !== 'leveringstid',
      )
      .filter(
        (i) =>
          customer.cardmsg.trim() !== '' || getSpecialKeyForItem(i) !== 'kort',
      )
      .map((item) => ({
        product: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
  }
}

/**
 * One archive payload per recipient: the raw draft (source) plus the derived
 * print snapshot. The main process assigns ids, timestamps, and retention.
 */
export function buildArchivedOrderPayloads(
  customers: Customer[],
  sender: OrderSender | null,
  delivery: DeliveryValues,
  items: Item[],
): NewArchivedOrder[] {
  return customers.map((customer) => ({
    source: { customer, sender, delivery, items },
    data: buildOrderData(customer, sender, delivery, items),
  }))
}
