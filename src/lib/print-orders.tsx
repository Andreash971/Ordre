import React from 'react'
import { pdf, Document } from '@react-pdf/renderer'
import { OrderPage } from '#/components/pdf/order'
import {
  exportOrdersToJson,
  getStoredOrders,
  type Customer,
  type CustomerFormValues,
  type DeliveryValues,
} from '#/lib/order-utils'
import type { Item } from '#/components/OrderColumns'

export async function openOrdersPdf(
  customers: Customer[],
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
) {
  exportOrdersToJson(customers, sender, delivery, items)
  const orders = getStoredOrders()
  const element = (
    <Document>
      {orders.map((o) => (
        <OrderPage key={o.key} data={o.data} />
      ))}
    </Document>
  )
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  window.open(url)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
