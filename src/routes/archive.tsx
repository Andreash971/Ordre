import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getStoredOrders, type StoredOrder } from '#/lib/order-utils'
import { OrderCard } from '@/components/ui/order-card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

import { Archive } from 'lucide-react'

export const Route = createFileRoute('/archive')({
  component: ArchivePage,
})

function ArchivePage() {
  const [orders, setOrders] = useState<StoredOrder[]>([])
  useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  return (
    <main className="page-wrap px-4 pb-8 pt-6">
      {orders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Archive />
            </EmptyMedia>
            <EmptyTitle>Ingen lagrede ordre</EmptyTitle>
            <EmptyDescription>
              Det er ingen lagrede ordre. Nye ordre vil automatisk bli lagret i
              7 dager.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Link to="/">
              <Button>Ny ordre</Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.key} order={order} />
          ))}
        </div>
      )}
    </main>
  )
}
