import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'

import CustomerForm from '../components/CustomerForm'
import TimeDateForm from '../components/TimeDateForm'
import OrderProductsContent from '#/components/OrderProductsContent'
import OrderExtraInfo from '#/components/OrderExtraInfo'
import OrderReceiverInfo from '#/components/OrderReceiverInfo'
import type { OrderReceiverInfoHandle } from '#/components/OrderReceiverInfo'
import {
  OrderFormProvider,
  useOrderForm,
} from '#/components/order-form/OrderFormContext'
import { Button } from '@/components/ui/button'
import OpenOrderButton from '@/components/ui/open-order-button'

import type { Item } from '#/components/OrderColumns'
import { getLocalDateString } from '#/lib/order-utils'
import type {
  CustomerFormValues,
  Customer,
  DeliveryValues,
} from '#/lib/order-utils'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <OrderFormProvider>
      <OrderFormView />
    </OrderFormProvider>
  )
}

function OrderFormView() {
  const { setShowTime } = useOrderForm()

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

  return (
    <main className="page-wrap flex flex-col gap-4 px-4 pb-8 pt-6">
      <div className="grid lg:grid-cols-[2fr_4fr] lg:grid-rows-[minmax(auto,clamp(400px,65vh,max-content))] gap-4">
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
          onItemsChange={setItems}
        />
      </div>
      <OrderExtraInfo
        className="rise-in"
        onCardTextSubmit={(value) =>
          orderReceiverRef.current?.updateSelectedCustomerField(
            'cardmsg',
            value,
          )
        }
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
        defaultDeliveryValues={deliveryValues}
        onCustomersChange={setCustomers}
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
