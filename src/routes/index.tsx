import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'

import CustomerForm from '../components/CustomerForm'
import TimeDateForm from '../components/TimeDateForm'
import OrderProductsContent from '#/components/OrderProductsContent'
import OrderExtraInfo from '#/components/OrderExtraInfo'
import OrderReceiverInfo, {
  type OrderReceiverInfoHandle,
} from '#/components/OrderReceiverInfo'
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
  const handleSetShowCardText = (value: boolean) => {
    setShowCardText(value)
    if (!value) setCardTextValue('')
  }

  const [showInstructionsText, setShowInstructionsText] = useState(false)
  const [instructionsTextValue, setInstructionsTextValue] = useState('')
  const handleSetShowInstructionsText = (value: boolean) => {
    setShowInstructionsText(value)
    if (!value) setInstructionsTextValue('')
  }

  const [senderValues, setSenderValues] = useState<CustomerFormValues | null>(
    null,
  )
  const [deliveryValues, setDeliveryValues] = useState<DeliveryValues>({
    date: getLocalDateString(),
    time: null,
  })
  const [items, setItems] = useState<Item[]>([])
  const orderReceiverRef = useRef<OrderReceiverInfoHandle>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerTime, setSelectedCustomerTime] = useState<
    string | null | undefined
  >(undefined)
  return (
    <main className="page-wrap flex flex-col gap-4 px-4 pb-8 pt-6">
      <div className="grid grid-cols-[2fr_4fr] grid-rows-[minmax(auto,clamp(400px,65vh,700px))] gap-4">
        <div className="flex flex-col gap-4">
          <CustomerForm
            size="default"
            formButtons={true}
            className="rise-in"
            onValuesChange={setSenderValues}
          />
          <TimeDateForm
            className="rise-in"
            onShowTimeChange={setShowTime}
            onValuesChange={setDeliveryValues}
          />
        </div>
        <OrderProductsContent
          className="rise-in min-h-0"
          showTime={showTime}
          showCardText={showCardText}
          selectedCustomerTime={selectedCustomerTime}
          onItemsChange={setItems}
        />
      </div>
      <OrderExtraInfo
        className="rise-in"
        showCardText={showCardText}
        setShowCardText={handleSetShowCardText}
        cardTextValue={cardTextValue}
        onCardTextValueChange={setCardTextValue}
        onCardTextSubmit={(value) =>
          orderReceiverRef.current?.updateSelectedCustomerField(
            'cardmsg',
            value,
          )
        }
        showInstructionsText={showInstructionsText}
        setShowInstructionsText={handleSetShowInstructionsText}
        instructionsTextValue={instructionsTextValue}
        onInstructionsTextValueChange={setInstructionsTextValue}
        onInstructionsSubmit={(value) =>
          orderReceiverRef.current?.updateSelectedCustomerField(
            'instructmsg',
            value,
          )
        }
      />
      <OrderReceiverInfo
        ref={orderReceiverRef}
        className="rise-in"
        showCardText={showCardText}
        showInstructionsText={showInstructionsText}
        showTime={showTime}
        defaultCardText={cardTextValue}
        defaultInstructionsText={instructionsTextValue}
        defaultDeliveryValues={deliveryValues}
        onCustomersChange={setCustomers}
        onSelectedCustomerTimeChange={setSelectedCustomerTime}
      />
      <div className="flex justify-end gap-2 rise-in">
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
