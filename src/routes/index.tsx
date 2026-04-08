import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'

import CustomerForm from '../components/CustomerForm'
import TimeDateForm from '../components/TimeDateForm'
import OrderProductsContent from '#/components/OrderProductsContent'
import OrderExtraInfo from '#/components/OrderExtraInfo'
import OrderReceiverInfo from '#/components/OrderReceiverInfo'
import { Button } from '@/components/ui/button'
import OpenOrderButton from '@/components/ui/open-order-button'

import type { Item } from '#/components/OrderColumns'
import {
  getLocalDateString,
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
  const [selectedCustomerTime, setSelectedCustomerTime] = useState<
    string | null | undefined
  >(undefined)
  return (
    <main className="page-wrap grid grid-cols-[2fr_4fr] grid-rows-[auto_auto_auto_auto] gap-4 px-4 pb-8 pt-6">
      <CustomerForm
        size="default"
        formButtons={true}
        className="col-start-1 row-start-1 rise-in"
        onValuesChange={setSenderValues}
      />
      <OrderProductsContent
        className="col-start-2 row-start-1 row-span-2 rise-in"
        showTime={showTime}
        showCardText={showCardText}
        selectedCustomerTime={selectedCustomerTime}
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
        showTime={showTime}
        defaultCardText={cardTextValue}
        defaultInstructionsText={instructionsTextValue}
        defaultDeliveryValues={deliveryValues}
        onCustomersChange={setCustomers}
        onSelectedCustomerTimeChange={setSelectedCustomerTime}
      />
      <div className="col-start-1 col-span-2 row-start-5 flex justify-end gap-2 rise-in">
        <Button
          onClick={() => {
            window.location.reload()
          }}
          variant="destructive"
          size="lg"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <OpenOrderButton
          customers={customers}
          senderValues={senderValues}
          deliveryValues={deliveryValues}
          items={items}
        />
      </div>
    </main>
  )
}
