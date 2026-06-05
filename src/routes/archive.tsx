import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Archive, Eye, Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { deleteStoredOrder, getStoredOrders } from '#/lib/order-utils'
import type { StoredOrder } from '#/lib/order-utils'
import { isSpecial } from '#/lib/special-items'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { DataTable } from '@/components/ui/DataTable'
import { OrderDetail } from '@/components/OrderDetailSheet'

export const Route = createFileRoute('/archive')({ component: ArchivePage })

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function orderSum(order: StoredOrder) {
  return order.data.orderContent.reduce((s, l) => s + l.total, 0)
}

function orderVisibleItemCount(order: StoredOrder) {
  return order.data.orderContent.filter((l) => !isSpecial({ name: l.product }))
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
      id: 'sender',
      header: () => <span>Avsender</span>,
      accessorFn: (o) =>
        `${o.data.sender.name} ${o.data.sender.company} ${o.data.sender.phone}`,
      meta: { truncate: true },
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">
            {row.original.data.sender.name || '—'}
          </div>
          {row.original.data.sender.company ? (
            <div className="truncate text-xs text-muted-foreground">
              {row.original.data.sender.company}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: 'receiver',
      header: () => <span>Mottaker</span>,
      accessorFn: (o) =>
        `${o.data.receiver.name} ${o.data.receiver.address} ${o.data.receiver.phone}`,
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

  function handleDelete(order: StoredOrder) {
    deleteStoredOrder(order.key)
    setOrders((prev) => prev.filter((o) => o.key !== order.key))
    setOpen(null)
  }

  return (
    <main className="rise-in page-wrap flex flex-col gap-4 px-4 pb-8 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Lagrede Ordre
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ordre lagres automatisk her. Klikk en rad for å se detaljer, skrive ut
          på nytt eller laste ned PDF.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <InputGroup className="w-full max-w-sm gray:bg-white/70 gray:border-border note:border-border">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Søk etter mottaker, adresse, dato…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <div className="font-mono text-xs text-muted-foreground self-end">
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
          {open ? (
            <OrderDetail order={open} onDelete={() => handleDelete(open)} />
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  )
}
