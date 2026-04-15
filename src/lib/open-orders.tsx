import React from 'react'
import { pdf, Document } from '@react-pdf/renderer'
import { OrderPage } from '#/components/pdf/order'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
  StoredOrder,
} from '#/lib/order-utils'
import { exportOrdersToJson, getCurrentOrders } from '#/lib/order-utils'
import type { Item } from '#/components/OrderColumns'

export async function openOrdersPdf(
  customers: Customer[],
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
) {
  exportOrdersToJson(customers, sender, delivery, items)
  const orders = getCurrentOrders(customers, sender, delivery, items)
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

export async function openStoredOrderPdf(order: StoredOrder) {
  const element = (
    <Document>
      <OrderPage key={order.key} data={order.data} />
    </Document>
  )
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  window.open(url)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
