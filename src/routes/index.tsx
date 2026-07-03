import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, FilePlusIcon } from 'lucide-react'

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
import { formatDeliveryDate } from '@/lib/order-utils'
import type { StoredOrder } from '@/lib/order-utils'
import { useOrders } from '@/lib/store-hooks'
import { formatNok, toIsoDate } from '@/lib/format'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const ordersById = useOrders()
  const orders = React.useMemo(() => Object.values(ordersById), [ordersById])
  const [open, setOpen] = React.useState<StoredOrder | null>(null)

  const today = toIsoDate()
  const upcoming = React.useMemo(
    () =>
      orders
        .filter((o) => (o.data.delivery.shortDate ? true : false))
        .filter((o) => {
          const iso = shortDateToIso(o.data.delivery.shortDate)
          return iso >= today
        })
        .sort((a, b) =>
          shortDateToIso(a.data.delivery.shortDate).localeCompare(
            shortDateToIso(b.data.delivery.shortDate),
          ),
        ),
    [orders, today],
  )

  const recent = React.useMemo(
    () => [...orders].sort((a, b) => b.savedAt - a.savedAt).slice(0, 6),
    [orders],
  )

  const headerCellClass =
    'font-mono text-[10px] uppercase tracking-wider text-muted-foreground'

  return (
    <main className="rise-in page-wrap flex flex-col gap-5 px-4 pb-12 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Ordreoversikt
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Kommende leveranser og siste ordre.
        </p>
      </div>

      <Button asChild size="lg" className="w-fit">
        <Link to="/new">
          <FilePlusIcon className="size-4" />
          Ny ordre
        </Link>
      </Button>

      <section className="grid gap-4 lg:grid-cols-[3fr_2fr] rise-in">
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Kommende leveringer
              </div>
              <div className="text-sm font-medium">
                {upcoming.length} planlagte
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/archive">
                Åpne arkiv
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
              Ingen kommende leveringer. Start en ny ordre for å fylle på.
            </div>
          ) : (
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className={headerCellClass}>Dato</TableHead>
                    <TableHead className={headerCellClass}>Mottaker</TableHead>
                    <TableHead className={headerCellClass}>Avsender</TableHead>
                    <TableHead className={headerCellClass}>Tid</TableHead>
                    <TableHead className={`${headerCellClass} text-right`}>
                      Sum
                    </TableHead>
                    <TableHead className="w-0 p-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.slice(0, 8).map((o) => {
                    const iso = shortDateToIso(o.data.delivery.shortDate)
                    const info = iso ? formatDeliveryDate(iso) : null
                    const sum = o.data.orderContent.reduce(
                      (s, l) => s + l.total,
                      0,
                    )
                    const isToday = iso === today
                    return (
                      <TableRow
                        key={o.key}
                        onClick={() => setOpen(o)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">
                              {info?.shortDate ?? o.data.delivery.shortDate}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {info?.dayText}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {o.data.receiver.name || 'Uten navn'}
                            </span>
                            {o.data.receiver.address ? (
                              <span className="text-xs text-muted-foreground">
                                {o.data.receiver.address}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {o.data.sender.name || '—'}
                            </span>
                            {o.data.sender.phone ? (
                              <span className="text-xs text-muted-foreground">
                                {o.data.sender.phone}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {o.data.delivery.deliveryTime || '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatNok(sum)}
                        </TableCell>
                        {isToday ? (
                          <TableCell className="w-0 whitespace-nowrap pl-2 pr-3">
                            <span className="inline-flex items-center rounded-md border bg-accent/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
                              I dag
                            </span>
                          </TableCell>
                        ) : (
                          <TableCell className="w-0 p-0" />
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Siste ordre
              </div>
              <div className="text-sm font-medium">{recent.length} nylige</div>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
              Ingen lagrede ordrer.
            </div>
          ) : (
            <div className="divide-y border-t">
              {recent.map((o) => (
                <div
                  key={o.key}
                  className="flex items-start justify-center gap-3 px-4 py-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px]">
                    {o.data.delivery.shortDate.slice(0, 5)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {o.data.receiver.name || 'Uten navn'}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {o.data.sender.name}
                      {' · '}
                      {o.data.orderContent.length} vare
                      {o.data.orderContent.length === 1 ? '' : 'r'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <OrderDetailSheet
        order={open}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />
    </main>
  )
}

function shortDateToIso(short: string): string {
  // short format: "DD.MM.YYYY"
  if (!short) return ''
  const parts = short.split('.')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m}-${d}`
}
