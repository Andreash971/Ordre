import { createFileRoute } from '@tanstack/react-router'
import { PDFViewer } from '@react-pdf/renderer'
import { OrderDocument, orderMockData } from '@/components/pdf/order'

export const Route = createFileRoute('/pdf')({
  component: PDF,
})

function PDF() {
  return (
    <main className="page-wrap px-4 py-12">
      <PDFViewer width="100%" height="800vh">
        <OrderDocument data={orderMockData} />
      </PDFViewer>
    </main>
  )
}
