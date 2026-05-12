import type { StoredOrder } from '#/lib/order-utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import OpenOrderButton from '@/components/ui/open-order-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function OrderDetail({ order }: { order: StoredOrder }) {
  const { data } = order
  const items = data.orderContent
  const sum = items.reduce((s, l) => s + l.total, 0)
  const hasCard = Boolean(data.card.cardText)
  const hasNotes = Boolean(data.card.instructionsText)

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Ordre
        </div>
        <SheetTitle className="font-heading text-xl">
          {data.receiver.name || 'Uten navn'}
        </SheetTitle>
        <SheetDescription>
          {data.delivery.dayText}, {data.delivery.longDate}
          {data.delivery.deliveryTime
            ? ` — kl. ${data.delivery.deliveryTime}`
            : ''}
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Mottaker
          </div>
          <div className="text-sm space-y-0.5">
            <div className="font-medium">{data.receiver.name || '—'}</div>
            {data.receiver.company ? (
              <div className="text-muted-foreground">
                {data.receiver.company}
              </div>
            ) : null}
            {data.receiver.address ? (
              <div className="text-muted-foreground">
                {data.receiver.address}
              </div>
            ) : null}
            {data.receiver.postCode ? (
              <div className="text-muted-foreground">
                {data.receiver.postCode}
              </div>
            ) : null}
            {data.receiver.phone ? (
              <div className="font-mono text-xs text-muted-foreground">
                {data.receiver.phone}
              </div>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Avsender
          </div>
          <div className="text-sm space-y-0.5">
            <div className="font-medium">{data.sender.name || '—'}</div>
            {data.sender.company ? (
              <div className="text-muted-foreground">{data.sender.company}</div>
            ) : null}
            {data.sender.phone ? (
              <div className="font-mono text-xs text-muted-foreground">
                {data.sender.phone}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Vare
              </TableHead>
              <TableHead className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Antall
              </TableHead>
              <TableHead className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Sum
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((line, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium truncate">
                  {line.product}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ×{line.quantity}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {nokFormatter.format(line.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasCard ? (
        <div className="rounded-lg border p-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Korttekst
          </div>
          <div className="text-sm rounded-md border p-2">
            {data.card.cardText}
          </div>
        </div>
      ) : null}

      {hasNotes ? (
        <div className="rounded-lg border p-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Spesielle instruksjoner
          </div>
          <div className="text-sm rounded-md border p-2">
            {data.card.instructionsText}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <div className="text-muted-foreground">Totalt</div>
          <div className="text-right font-mono font-medium">
            {nokFormatter.format(sum)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Lagret{' '}
          {new Date(order.savedAt).toLocaleDateString('nb-NO', {
            dateStyle: 'medium',
          })}
          {' · '}
          utløper{' '}
          {new Date(order.expiresAt).toLocaleDateString('nb-NO', {
            dateStyle: 'medium',
          })}
        </div>
        <OpenOrderButton storedOrder={order} />
      </div>
    </div>
  )
}

export function OrderDetailSheet({
  order,
  onOpenChange,
}: {
  order: StoredOrder | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={order !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {order ? <OrderDetail order={order} /> : null}
      </SheetContent>
    </Sheet>
  )
}
