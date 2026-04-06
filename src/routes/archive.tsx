import { createFileRoute } from '@tanstack/react-router'
import { getStoredOrders } from '#/lib/order-utils'
import { OrderCard } from '@/components/ui/order-card'

export const Route = createFileRoute('/archive')({
  component: Archive,
})

function Archive() {
  const orders = getStoredOrders()

  return (
    <main className="page-wrap px-4 pb-8 pt-6">
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Ingen lagrede ordre.</p>
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
