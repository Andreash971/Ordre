import React from 'react'
import { pdf, Document } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { OrderPage } from '@/components/pdf/order'
import type { OrderData } from '@shared/orders'
import { getStoredSettings } from '@/lib/settings'

async function pdfElementToBuffer(
  element: React.ReactElement<DocumentProps>,
): Promise<ArrayBuffer> {
  const blob = await pdf(element).toBlob()
  return blob.arrayBuffer()
}

function orderDocument(dataList: OrderData[]) {
  return (
    <Document>
      {dataList.map((data, i) => (
        <OrderPage key={i} data={data} />
      ))}
    </Document>
  )
}

/** Render the given order slips to PDF and open it in the system viewer. */
export async function openOrdersPdf(dataList: OrderData[]) {
  const buffer = await pdfElementToBuffer(orderDocument(dataList))
  await window.electronAPI.pdf.open(buffer)
}

/** Render the given order slips to PDF and send them to the default printer. */
export async function printOrdersPdf(dataList: OrderData[]) {
  const buffer = await pdfElementToBuffer(orderDocument(dataList))
  const { defaultPrinter } = getStoredSettings()
  await window.electronAPI.printer.print(buffer, defaultPrinter ?? undefined)
}
