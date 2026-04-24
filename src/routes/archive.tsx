import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Archive, Eye, Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { getStoredOrders } from '#/lib/order-utils'
import type { StoredOrder } from '#/lib/order-utils'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import OpenOrderButton from '@/components/ui/open-order-button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { DataTable } from '@/components/ui/DataTable'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/archive')({ component: ArchivePage })

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

const SPECIAL_ITEMS = new Set(['Frakt', 'Frakt Tidspunktstillegg', 'Kort'])

function orderSum(order: StoredOrder) {
  return order.data.orderContent.reduce((s, l) => s + l.total, 0)
}

function orderVisibleItemCount(order: StoredOrder) {
  return order.data.orderContent.filter((l) => !SPECIAL_ITEMS.has(l.product))
    .length
}

function buildColumns(
  onView: (order: StoredOrder) => void,
): ColumnDef<StoredOrder>[] {
  return [
    {
      id: 'date',
      header: () => <span>Dato</span>,
      accessorFn: (o) =>
        `${o.data.delivery.shortDate} ${o.data.delivery.deliveryTime}`,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">
            {row.original.data.delivery.shortDate || '—'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {row.original.data.delivery.deliveryTime || 'Ingen tid'}
          </span>
        </div>
      ),
    },
    {
      id: 'receiver',
      header: () => <span>Mottaker</span>,
      accessorFn: (o) =>
        `${o.data.receiver.name} ${o.data.receiver.address} ${o.data.receiver.phone} ${o.data.sender.name}`,
      meta: { priority: 'primary', truncate: true },
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">
            {row.original.data.receiver.name || 'Uten navn'}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {row.original.data.receiver.address || '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'items',
      header: () => <div className="text-right">Varer</div>,
      accessorFn: (o) => orderVisibleItemCount(o),
      cell: ({ row }) => (
        <div className="text-right font-mono text-xs">
          {orderVisibleItemCount(row.original)}
        </div>
      ),
    },
    {
      id: 'sum',
      header: () => <div className="text-right">Sum</div>,
      accessorFn: (o) => orderSum(o),
      cell: ({ row }) => (
        <div className="text-right font-mono text-xs">
          {nokFormatter.format(orderSum(row.original))}
        </div>
      ),
    },
    {
      id: 'action',
      header: () => <div className="text-right">Handling</div>,
      meta: { action: true },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView(row.original)
            }}
          >
            <Eye className="size-3" />
            Vis
          </Button>
        </div>
      ),
    },
  ]
}

function ArchivePage() {
  const [orders, setOrders] = React.useState<StoredOrder[]>([])
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState<StoredOrder | null>(null)

  React.useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  const sorted = React.useMemo(
    () => [...orders].sort((a, b) => b.savedAt - a.savedAt),
    [orders],
  )

  const columns = React.useMemo(() => buildColumns(setOpen), [])

  return (
    <main className="rise-in page-wrap flex flex-col gap-4 px-4 pb-12 pt-6">
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Arkiv
        </div>
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Lagrede ordrer
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ordrer lagres automatisk. Klikk en rad for å se detaljer, skrive ut på
          nytt eller laste ned PDF.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <InputGroup className="w-full max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Søk etter mottaker, adresse, dato…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <div className="font-mono text-xs text-muted-foreground">
          {orders.length} lagret
        </div>
      </div>

      {orders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Archive />
            </EmptyMedia>
            <EmptyTitle>Ingen lagrede ordre</EmptyTitle>
            <EmptyDescription>
              Nye ordre lagres automatisk her. Standard oppbevaringstid er 7
              dager.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Link to="/new">
              <Button>Ny ordre</Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable
          columns={columns}
          data={sorted}
          globalFilter={query}
          onRowClick={(row) => setOpen(row.original)}
          emptyMessage="Ingen ordre matcher søket."
        />
      )}

      <Sheet
        open={open !== null}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open ? <OrderDetail order={open} /> : null}
        </SheetContent>
      </Sheet>
    </main>
  )
}

function OrderDetail({ order }: { order: StoredOrder }) {
  const { data } = order
  const items = data.orderContent
  const sum = items.reduce((s, l) => s + l.total, 0)
  const vat = Math.round(sum * 0.25)
  const hasCard = Boolean(data.card.cardText)
  const hasNotes = Boolean(data.card.instructionsText)

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
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
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Mottaker
          </div>
          <div className="text-sm space-y-0.5">
            <div className="font-medium">{data.receiver.name || '—'}</div>
            {data.receiver.company ? (
              <div className="text-muted-foreground">{data.receiver.company}</div>
            ) : null}
            {data.receiver.address ? (
              <div className="text-muted-foreground">
                {data.receiver.address}
              </div>
            ) : null}
            {data.receiver.postCode ? (
              <div className="text-muted-foreground">{data.receiver.postCode}</div>
            ) : null}
            {data.receiver.phone ? (
              <div className="font-mono text-xs text-muted-foreground">
                {data.receiver.phone}
              </div>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
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
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-muted/40 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <div>Vare</div>
          <div className="text-right">Antall</div>
          <div className="text-right">Sum</div>
        </div>
        <div className="divide-y">
          {items.map((line, i) => (
            <div
              key={i}
              className={cn(
                'grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 text-sm',
                SPECIAL_ITEMS.has(line.product) && 'bg-accent/10',
              )}
            >
              <div className="font-medium truncate">{line.product}</div>
              <div className="text-right font-mono">×{line.quantity}</div>
              <div className="text-right font-mono">
                {nokFormatter.format(line.total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasCard ? (
        <div className="rounded-lg border p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Kortmelding
          </div>
          <div className="rounded-md bg-[#f4ece0] text-[#1d1714] font-serif text-base leading-relaxed p-4 whitespace-pre-wrap shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            {data.card.cardText}
          </div>
        </div>
      ) : null}

      {hasNotes ? (
        <div className="rounded-lg border p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Spesielle instruksjoner
          </div>
          <div className="text-sm whitespace-pre-wrap">
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
          <div className="text-xs text-muted-foreground">MVA (25%, inkl.)</div>
          <div className="text-right font-mono text-xs text-muted-foreground">
            {nokFormatter.format(vat)}
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
