import { useState } from 'react'
import { Printer, FileDown } from 'lucide-react'
import type { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import {
  openOrdersPdf,
  openStoredOrderPdf,
  printOrdersPdf,
  printStoredOrderPdf,
} from '#/lib/open-orders'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
  StoredOrder,
} from '#/lib/order-utils'
import type { Item } from '#/components/OrderColumns'
import { TooltipWrapper } from './TooltipWrapper'
import { getStoredSettings } from '#/lib/settings'

type OpenOrderButtonProps =
  | {
      storedOrder: StoredOrder
      customers?: never
      senderValues?: never
      deliveryValues?: never
      items?: never
      beforeSubmit?: never
      variant?: VariantProps<typeof buttonVariants>['variant']
    }
  | {
      storedOrder?: never
      customers: Customer[]
      senderValues: CustomerFormValues | null
      deliveryValues: DeliveryValues
      items: Item[]
      beforeSubmit?: () => Promise<boolean>
      variant?: VariantProps<typeof buttonVariants>['variant']
    }

export default function OpenOrderButton({
  storedOrder,
  customers,
  senderValues,
  deliveryValues,
  items,
  beforeSubmit,
  variant = 'default',
}: OpenOrderButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const defaultPrinter = getStoredSettings().defaultPrinter

  const handleOpenPdf = async () => {
    setIsPrinting(true)
    try {
      if (storedOrder) {
        await openStoredOrderPdf(storedOrder)
      } else {
        if (beforeSubmit && !(await beforeSubmit())) return
        await openOrdersPdf(customers, senderValues, deliveryValues, items)
      }
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      if (storedOrder) {
        await printStoredOrderPdf(storedOrder)
      } else {
        if (beforeSubmit && !(await beforeSubmit())) return
        await printOrdersPdf(customers, senderValues, deliveryValues, items)
      }
    } finally {
      setIsPrinting(false)
    }
  }

  const isDisabled = isPrinting || (!storedOrder && customers.length === 0)

  if (defaultPrinter) {
    return (
      <div className="flex gap-1">
        <TooltipWrapper TooltipText="Åpne PDF i din PDF-leser">
          <Button
            onClick={handleOpenPdf}
            disabled={isDisabled}
            variant="outline"
            size="lg"
          >
            <FileDown className="h-4 w-4" />
            Lagre som PDF
          </Button>
        </TooltipWrapper>
        <TooltipWrapper TooltipText={`Skriv ut til ${defaultPrinter}`}>
          <Button
            onClick={handlePrint}
            disabled={isDisabled}
            variant={variant}
            size="lg"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Skriver ut…' : 'Skriv ut'}
          </Button>
        </TooltipWrapper>
      </div>
    )
  }

  return (
    <TooltipWrapper TooltipText="Åpne PDF i din PDF-leser">
      <Button
        onClick={handleOpenPdf}
        disabled={isDisabled}
        variant={variant}
        size="lg"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? 'Laster PDF...' : 'Lag PDF'}
      </Button>
    </TooltipWrapper>
  )
}
