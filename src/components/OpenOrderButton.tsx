import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Printer, FileDown } from 'lucide-react'
import type { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { openOrdersPdf, printOrdersPdf } from '@/lib/open-orders'
import { buildArchivedOrderPayloads } from '@/lib/order-utils'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '@/lib/order-utils'
import type { ArchivedOrder, OrderData } from '@shared/orders'
import { insertOrders } from '@/lib/order-server-fns'
import { queryKeys } from '@/lib/query-keys'
import type { Item } from '@/components/OrderColumns'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'
import { useSettings } from '@/lib/store-hooks'

type OpenOrderButtonProps =
  | {
      storedOrder: ArchivedOrder
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
  const queryClient = useQueryClient()
  const defaultPrinter = useSettings().defaultPrinter

  /**
   * Archive the current order (unless re-printing an already archived one)
   * and return the print data, or null when beforeSubmit cancels.
   */
  const archiveAndCollect = async (): Promise<OrderData[] | null> => {
    if (storedOrder) return [storedOrder.data]
    if (beforeSubmit && !(await beforeSubmit())) return null
    const payloads = buildArchivedOrderPayloads(
      customers,
      senderValues,
      deliveryValues,
      items,
    )
    await insertOrders({ data: payloads })
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    return payloads.map((p) => p.data)
  }

  const handleOpenPdf = async () => {
    setIsPrinting(true)
    try {
      const dataList = await archiveAndCollect()
      if (!dataList) return
      await openOrdersPdf(dataList)
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      const dataList = await archiveAndCollect()
      if (!dataList) return
      await printOrdersPdf(dataList)
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
