import React from 'react'
import { pdf, Document } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { OrderPage } from '#/components/pdf/order'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
  StoredOrder,
} from '#/lib/order-utils'
import { exportOrdersToJson, getCurrentOrders } from '#/lib/order-utils'
import type { Item } from '#/components/OrderColumns'
import { getStoredSettings } from '#/lib/settings'

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

async function pdfElementToBuffer(
  element: React.ReactElement<DocumentProps>,
): Promise<ArrayBuffer> {
  const blob = await pdf(element).toBlob()
  return blob.arrayBuffer()
}

export async function printOrdersPdf(
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
  const buffer = await pdfElementToBuffer(element)
  const { defaultPrinter } = getStoredSettings()
  await window.electronAPI.printer.print(buffer, defaultPrinter ?? undefined)
}

export async function printStoredOrderPdf(order: StoredOrder) {
  const element = (
    <Document>
      <OrderPage key={order.key} data={order.data} />
    </Document>
  )
  const buffer = await pdfElementToBuffer(element)
  const { defaultPrinter } = getStoredSettings()
  await window.electronAPI.printer.print(buffer, defaultPrinter ?? undefined)
}
