import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Check, ChevronRight, FilePlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderDetailSheet } from '@/components/OrderDetailSheet'
import { SectionHead } from '@/components/SectionHead'
import { KpiCard } from '@/components/KpiCard'
import { MissingFieldsBadge } from '@/components/MissingFieldsBadge'
import {
  formatDeliveryDate,
  orderReceiverLabel,
  orderReceiverRepresentative,
  orderSenderLabel,
  orderSenderRepresentative,
} from '@/lib/order-utils'
import { orderMissingFields } from '@/lib/order-review'
import type { ArchivedOrder } from '@shared/orders'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteOrder, getAllOrders } from '@/lib/order-server-fns'
import { queryKeys } from '@/lib/query-keys'
import { formatNok, toIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: Dashboard })

function orderSum(order: ArchivedOrder) {
  return order.data.orderContent.reduce((s, l) => s + l.total, 0)
}

const headerCellClass =
  'font-mono text-[10px] uppercase tracking-wider text-muted-foreground'

/** Full-width divider row separating groups inside the deliveries table. */
function TableSectionRow({
  children,
  tinted,
}: {
  children: React.ReactNode
  tinted?: boolean
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={5}
        className={cn(
          'py-2 text-xs font-semibold first-letter:uppercase',
          tinted ? 'bg-primary/10' : 'bg-muted/60',
        )}
      >
        {children}
      </TableCell>
    </TableRow>
  )
}

function DeliveryRow({
  order,
  onOpen,
}: {
  order: ArchivedOrder & { deliveryDate: string }
  onOpen: (order: ArchivedOrder) => void
}) {
  const missing = orderMissingFields(order)
  const isToday = order.deliveryDate === toIsoDate()
  const info = formatDeliveryDate(order.deliveryDate)
  return (
    <TableRow onClick={() => onOpen(order)} className="cursor-pointer">
      <TableCell className="w-16">
        {isToday ? (
          <span className="font-mono text-xs">
            {order.data.delivery.deliveryTime || '—'}
          </span>
        ) : (
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {info.shortDate.slice(0, 5)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {info.dayText.slice(0, 3)}
            </span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{orderReceiverLabel(order)}</span>
          {orderReceiverRepresentative(order) ? (
            <span className="text-xs text-muted-foreground">
              v/ {orderReceiverRepresentative(order)}
            </span>
          ) : null}
          {order.data.receiver.address ? (
            <span className="text-xs text-muted-foreground">
              {order.data.receiver.address}
            </span>
          ) : null}
          {order.data.receiver.phone ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.data.receiver.phone}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-muted-foreground">
            {orderSenderLabel(order)}
          </span>
          {orderSenderRepresentative(order) ? (
            <span className="text-xs text-muted-foreground">
              v/ {orderSenderRepresentative(order)}
            </span>
          ) : null}
          {order.data.sender.phone ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.data.sender.phone}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {missing.length > 0 ? (
          <MissingFieldsBadge fields={missing} />
        ) : (
          <span className="font-mono text-xs">
            {formatNok(orderSum(order))}
          </span>
        )}
      </TableCell>
      <TableCell className="w-8 pl-0 pr-3">
        <ChevronRight className="size-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}

function Dashboard() {
  const queryClient = useQueryClient()
  const { data: orders = [] } = useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: getAllOrders,
  })
  const [open, setOpen] = React.useState<ArchivedOrder | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })

  function handleDelete(order: ArchivedOrder) {
    deleteMutation.mutate(order.id)
    setOpen(null)
  }

  const today = toIsoDate()
  const upcoming = React.useMemo(
    () =>
      orders
        .filter(
          (o): o is ArchivedOrder & { deliveryDate: string } =>
            o.deliveryDate != null && o.deliveryDate >= today,
        )
        .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate)),
    [orders, today],
  )

  const recent = React.useMemo(
    () => [...orders].sort((a, b) => b.savedAt - a.savedAt).slice(0, 6),
    [orders],
  )

  const todayOrders = upcoming.filter((o) => o.deliveryDate === today)
  const laterOrders = upcoming
    .filter((o) => o.deliveryDate !== today)
    .slice(0, 8)
  const flagged = upcoming.filter((o) => orderMissingFields(o).length > 0)
  const todaySum = todayOrders.reduce((s, o) => s + orderSum(o), 0)

  const endOfWeek = React.useMemo(() => {
    const d = new Date()
    // Through Sunday of the current week (Norwegian weeks start on Monday).
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7))
    return toIsoDate(d)
  }, [])
  const weekCount = upcoming.filter((o) => o.deliveryDate <= endOfWeek).length

  const todayLabel = new Date().toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="rise-in page-wrap flex flex-col gap-6 px-4 pb-12 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-medium leading-tight">
            Oversikt
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Kommende leveringer og siste ordre.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/new">
            <FilePlusIcon className="size-4" />
            Ny ordre
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Leveres i dag"
          value={todayOrders.length}
          unit="ordre"
        />
        <KpiCard label="Leveres denne uken" value={weekCount} unit="ordre" />
        {flagged.length > 0 ? (
          <KpiCard
            label="Trenger gjennomgang"
            value={flagged.length}
            unit="ordre"
            warn
            onClick={() => setOpen(flagged[0])}
          />
        ) : (
          <KpiCard
            label="Trenger gjennomgang"
            value={
              <span className="flex items-center gap-1.5 text-base font-medium text-primary">
                <Check className="size-4" />
                Alt klart
              </span>
            }
          />
        )}
        <KpiCard label="Sum dagens ordre" value={formatNok(todaySum)} />
      </section>

      <section className="grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <SectionHead title="Kommende leveringer" sub="Sortert etter dato" />
          <div className="overflow-hidden rounded-lg border bg-card">
            {upcoming.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Ingen kommende leveringer. Start en ny ordre for å fylle på.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className={headerCellClass}>Leveres</TableHead>
                    <TableHead className={headerCellClass}>Mottaker</TableHead>
                    <TableHead className={headerCellClass}>Avsender</TableHead>
                    <TableHead className={`${headerCellClass} text-right`}>
                      Sum
                    </TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableSectionRow tinted>I dag · {todayLabel}</TableSectionRow>
                  {todayOrders.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="py-4 text-sm text-muted-foreground"
                      >
                        Ingen leveringer i dag.
                      </TableCell>
                    </TableRow>
                  ) : (
                    todayOrders.map((o) => (
                      <DeliveryRow key={o.id} order={o} onOpen={setOpen} />
                    ))
                  )}
                  {laterOrders.length > 0 ? (
                    <>
                      <TableSectionRow>Senere</TableSectionRow>
                      {laterOrders.map((o) => (
                        <DeliveryRow key={o.id} order={o} onOpen={setOpen} />
                      ))}
                    </>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <SectionHead title="Siste ordre" />
            <Button asChild variant="ghost" size="sm">
              <Link to="/archive">
                Åpne arkiv
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            {recent.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Ingen lagrede ordrer.
              </div>
            ) : (
              <div className="divide-y">
                {recent.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOpen(o)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted font-mono text-[10px] text-muted-foreground">
                      {o.data.delivery.shortDate.slice(0, 5)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {orderReceiverLabel(o)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {orderSenderLabel(o)}
                        {' · '}
                        {o.data.orderContent.length} vare
                        {o.data.orderContent.length === 1 ? '' : 'r'}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <OrderDetailSheet
        order={open}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
        onDelete={() => {
          if (open) handleDelete(open)
        }}
      />
    </main>
  )
}
