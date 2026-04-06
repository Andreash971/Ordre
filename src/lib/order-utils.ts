import type { Item } from '#/components/OrderColumns'
import type { OrderData } from '#/components/pdf/order'

export type CustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
}

export type Customer = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  cardmsg: string
  instructmsg: string
  date: string
  time: string | null
}

export type DeliveryValues = { date: string; time: string | null }

export function getLocalDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDeliveryDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const raw = date.toLocaleDateString('nb-NO', { weekday: 'long' })
  const dayText = raw.charAt(0).toUpperCase() + raw.slice(1)
  const longDate = date.toLocaleDateString('nb-NO', { dateStyle: 'long' })
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortDate = `${day}.${month}.${date.getFullYear()}`
  return { dayText, longDate, shortDate }
}

export function buildOrderData(
  customer: Customer,
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
): OrderData {
  const effectiveDate = customer.date || delivery.date
  const { dayText, longDate, shortDate } = formatDeliveryDate(effectiveDate)
  return {
    delivery: {
      dayText,
      longDate,
      shortDate,
      deliveryTime: customer.time ?? '',
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
      co: '',
      address: customer.address,
      postCode: `${customer.postcode} ${customer.city}`.trim(),
      phone: customer.phone,
    },
    card: {
      cardText: customer.cardmsg,
      instructionsText: customer.instructmsg,
    },
    orderContent: (customer.time !== null
      ? items
      : items.filter((i) => i.name !== 'Frakt Tidspunktstillegg')
    ).map((item) => ({
      product: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
  }
}

export type StoredOrder = {
  data: OrderData
  savedAt: number
  expiresAt: number
  key: string
}

const STORAGE_KEY = 'ordreflyt_orders'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export function exportOrdersToJson(
  customers: Customer[],
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
) {
  const stored: Record<string, StoredOrder> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}',
  )
  const now = Date.now()
  customers.forEach((customer, index) => {
    const orderData = buildOrderData(customer, sender, delivery, items)
    const safeName = (customer.name || `mottaker-${index + 1}`)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const key = `ordre-${safeName}`
    stored[key] = {
      data: orderData,
      savedAt: now,
      expiresAt: now + EXPIRY_MS,
      key,
    }
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function getCurrentOrders(
  customers: Customer[],
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
): StoredOrder[] {
  const now = Date.now()
  return customers.map((customer, index) => {
    const orderData = buildOrderData(customer, sender, delivery, items)
    const safeName = (customer.name || `mottaker-${index + 1}`)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const key = `ordre-${safeName}`
    return { data: orderData, savedAt: now, expiresAt: now + EXPIRY_MS, key }
  })
}

export function getStoredOrders(): StoredOrder[] {
  const stored: Record<string, StoredOrder> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}',
  )
  const now = Date.now()
  const active: Record<string, StoredOrder> = {}
  for (const [k, v] of Object.entries(stored)) {
    if (now <= v.expiresAt) active[k] = v
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
  return Object.values(active)
}
