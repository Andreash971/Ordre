import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import OpenOrderButton from '@/components/ui/open-order-button'
import type { StoredOrder } from '#/lib/order-utils'

const EXCLUDED_PRODUCTS = ['Frakt', 'Frakt Tidspunktstillegg']

interface OrderCardProps {
  order: StoredOrder
}

export function OrderCard({ order }: OrderCardProps) {
  const { data } = order

  const deliveryLabel = [data.delivery.longDate, data.delivery.deliveryTime]
    .filter(Boolean)
    .join(' kl. ')

  const filteredItems = data.orderContent.filter(
    (item) => !EXCLUDED_PRODUCTS.includes(item.product),
  )

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{data.receiver.name || 'Ukjent mottaker'}</CardTitle>
        <CardDescription>
          Firma: {data.receiver.company || 'Privatperson'}
        </CardDescription>
        <CardDescription>Lev. {deliveryLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-1">
        <Card size="sm" className="flex-1">
          <CardContent>
            <ul className="text-sm space-y-0.5">
              {filteredItems.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{item.product}</span>
                  <span className="text-muted-foreground shrink-0">
                    ×{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="justify-between items-end">
        <div className="flex flex-col">
          <p className="text-sm">Sender:</p>
          <p className="text-sm font-medium">{data.sender.name}</p>
          <p className="text-xs text-muted-foreground">
            {data.sender.company || 'Privatperson'}
          </p>
        </div>
        <OpenOrderButton storedOrder={order} variant="outline" />
      </CardFooter>
    </Card>
  )
}
