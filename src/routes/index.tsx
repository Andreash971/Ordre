import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Download } from 'lucide-react'

import CustomerForm from '../components/CustomerForm'
import TimeDateForm from '../components/TimeDateForm'
import OrderProductsContent from '#/components/OrderProductsContent'
import OrderExtraInfo from '#/components/OrderExtraInfo'
import OrderReceiverInfo from '#/components/OrderReceiverInfo'
import { Button } from '@/components/ui/button'
import type { Item } from '#/components/OrderColumns'
import type { OrderData } from '#/components/pdf/order'

export const Route = createFileRoute('/')({ component: App })

type CustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
}

type Customer = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  cardmsg: string
  instructmsg: string
}

type DeliveryValues = { date: string; time: string | null }

function getLocalDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDeliveryDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const raw = date.toLocaleDateString('nb-NO', { weekday: 'long' })
  const dayText = raw.charAt(0).toUpperCase() + raw.slice(1)
  const longDate = date.toLocaleDateString('nb-NO', { dateStyle: 'long' })
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortDate = `${day}.${month}.${date.getFullYear()}`
  return { dayText, longDate, shortDate }
}

function buildOrderData(
  customer: Customer,
  sender: CustomerFormValues | null,
  delivery: DeliveryValues,
  items: Item[],
): OrderData {
  const { dayText, longDate, shortDate } = formatDeliveryDate(delivery.date)
  return {
    delivery: {
      dayText,
      longDate,
      shortDate,
      deliveryTime: delivery.time ?? '',
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
    orderContent: items.map((item) => ({
      product: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
  }
}

function App() {
  const [showTime, setShowTime] = useState(false)
  const [showCardText, setShowCardText] = useState(false)
  const [cardTextValue, setCardTextValue] = useState('')
  const [showInstructionsText, setShowInstructionsText] = useState(false)
  const [instructionsTextValue, setInstructionsTextValue] = useState('')

  const [senderValues, setSenderValues] = useState<CustomerFormValues | null>(
    null,
  )
  const [deliveryValues, setDeliveryValues] = useState<DeliveryValues>({
    date: getLocalDateString(),
    time: null,
  })
  const [items, setItems] = useState<Item[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  function handleExportJson() {
    customers.forEach((customer, index) => {
      const orderData = buildOrderData(
        customer,
        senderValues,
        deliveryValues,
        items,
      )
      const blob = new Blob([JSON.stringify(orderData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = (customer.name || `mottaker-${index + 1}`)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      a.href = url
      a.download = `ordre-${safeName}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <main className="page-wrap grid grid-cols-[2fr_4fr] grid-rows-[auto_auto_auto_auto] gap-4 px-4 pb-8 pt-6">
      <CustomerForm
        formButtons={true}
        saveText="Lagre Kunde"
        className="col-start-1 row-start-1 rise-in"
        onValuesChange={setSenderValues}
      />
      <OrderProductsContent
        className="col-start-2 row-start-1 row-span-2 rise-in"
        showTime={showTime}
        showCardText={showCardText}
        onItemsChange={setItems}
      />
      <TimeDateForm
        className="col-start-1 row-start-2 rise-in"
        onShowTimeChange={setShowTime}
        onValuesChange={setDeliveryValues}
      />
      <OrderExtraInfo
        className="col-start-1 row-start-3 col-span-2 rise-in"
        showCardText={showCardText}
        onCardTextChange={setShowCardText}
        cardTextValue={cardTextValue}
        onCardTextValueChange={setCardTextValue}
        showInstructionsText={showInstructionsText}
        onInstructionsChange={setShowInstructionsText}
        instructionsTextValue={instructionsTextValue}
        onInstructionsTextValueChange={setInstructionsTextValue}
      />
      <OrderReceiverInfo
        className="col-start-1 row-start-4 col-span-2 rise-in"
        showCardText={showCardText}
        showInstructionsText={showInstructionsText}
        defaultCardText={cardTextValue}
        defaultInstructionsText={instructionsTextValue}
        onCustomersChange={setCustomers}
      />
      <div className="col-start-1 col-span-2 row-start-5 flex justify-end rise-in">
        <Button onClick={handleExportJson} disabled={customers.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Eksporter JSON
        </Button>
      </div>
    </main>
  )
}
