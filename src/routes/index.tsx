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
import {
  getLocalDateString,
  exportOrdersToJson,
  type CustomerFormValues,
  type Customer,
  type DeliveryValues,
} from '#/lib/order-utils'

export const Route = createFileRoute('/')({ component: App })

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
        <Button
          onClick={() =>
            exportOrdersToJson(customers, senderValues, deliveryValues, items)
          }
          disabled={customers.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Eksporter JSON
        </Button>
      </div>
    </main>
  )
}
