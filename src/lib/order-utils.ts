import type { Item } from '@/components/OrderColumns'
import type {
  CustomerFormValues,
  DeliveryValues,
  NewArchivedOrder,
  OrderData,
  OrderRecipient,
} from '@shared/orders'
import { getStoredSettings } from '@/lib/settings'
import { getSpecialKeyForItem } from '@/lib/special-items'

export type { CustomerFormValues, DeliveryValues }
export type Customer = OrderRecipient

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
  sender: CustomerFormValues | null,
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
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
): NewArchivedOrder[] {
  return customers.map((customer) => ({
    source: { customer, sender, delivery, items },
    data: buildOrderData(customer, sender, delivery, items),
  }))
}
