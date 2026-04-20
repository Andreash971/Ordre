import { useState } from 'react'
import { Printer } from 'lucide-react'
import type { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { openOrdersPdf, openStoredOrderPdf } from '#/lib/open-orders'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
  StoredOrder,
} from '#/lib/order-utils'
import type { Item } from '#/components/OrderColumns'
import { TooltipWrapper } from './TooltipWrapper'

type OpenOrderButtonProps =
  | {
      storedOrder: StoredOrder
      customers?: never
      senderValues?: never
      deliveryValues?: never
      items?: never
      variant?: VariantProps<typeof buttonVariants>['variant']
    }
  | {
      storedOrder?: never
      customers: Customer[]
      senderValues: CustomerFormValues | null
      deliveryValues: DeliveryValues
      items: Item[]
      variant?: VariantProps<typeof buttonVariants>['variant']
    }

export default function OpenOrderButton({
  storedOrder,
  customers,
  senderValues,
  deliveryValues,
  items,
  variant = 'default',
}: OpenOrderButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handleOpenOrders = async () => {
    setIsPrinting(true)
    try {
      if (storedOrder) {
        await openStoredOrderPdf(storedOrder)
      } else {
        await openOrdersPdf(customers, senderValues, deliveryValues, items)
      }
    } finally {
      setIsPrinting(false)
    }
  }

  const isDisabled = isPrinting || (!storedOrder && customers.length === 0)

  return (
    <TooltipWrapper TooltipText="Lagre ordre og åpne PDF i ny fane">
      <Button
        onClick={handleOpenOrders}
        disabled={isDisabled}
        variant={variant}
        size="lg"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? 'Åpner PDF...' : 'Åpne PDF'}
      </Button>
    </TooltipWrapper>
  )
}
