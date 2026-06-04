import type { Item } from '#/components/OrderColumns'
import type { OrderData } from '#/components/pdf/order'
import { getRetentionMs, getStoredSettings } from '#/lib/settings'
import { getSpecialKeyForItem } from '#/lib/special-items'
import {
  clearOrdersInCache,
  getCache,
  setOrdersInCache,
} from '#/lib/store-cache'

export type CustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  careof: string
}

export type Customer = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  careof: string
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
          customer.time !== null ||
          getSpecialKeyForItem(i) !== 'leveringstid',
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

export type StoredOrder = {
  data: OrderData
  savedAt: number
  expiresAt: number
  key: string
}

export function exportOrdersToJson(
  customers: Customer[],
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
) {
  const stored: Record<string, StoredOrder> = { ...getCache().orders }
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
      expiresAt: now + getRetentionMs(),
      key,
    }
  })
  setOrdersInCache(stored)
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
    return {
      data: orderData,
      savedAt: now,
      expiresAt: now + getRetentionMs(),
      key,
    }
  })
}

export function getStoredOrders(): StoredOrder[] {
  const stored = getCache().orders
  const now = Date.now()
  const active: Record<string, StoredOrder> = {}
  let pruned = false
  for (const [k, v] of Object.entries(stored)) {
    if (now <= v.expiresAt) {
      active[k] = v
    } else {
      pruned = true
    }
  }
  if (pruned) setOrdersInCache(active)
  return Object.values(active)
}

export function clearArchive(): void {
  clearOrdersInCache()
}
