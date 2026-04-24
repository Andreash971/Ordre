import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  CalendarClock,
  FilePlusIcon,
  IdCard,
  Package,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  formatDeliveryDate,
  getLocalDateString,
  getStoredOrders,
} from '#/lib/order-utils'
import type { StoredOrder } from '#/lib/order-utils'
import { queryKeys } from '#/lib/query-keys'
import { getAllCustomers } from '#/lib/customer-server-fns'
import { getAllProducts } from '#/lib/product-server-fns'

export const Route = createFileRoute('/')({ component: Dashboard })

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

function Dashboard() {
  const [orders, setOrders] = React.useState<StoredOrder[]>([])
  React.useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => getAllCustomers(),
    staleTime: 60_000,
  })
  const { data: products } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => getAllProducts(),
    staleTime: 60_000,
  })

  const today = getLocalDateString()
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

  const deliveriesToday = upcoming.filter(
    (o) => shortDateToIso(o.data.delivery.shortDate) === today,
  )
  const recent = React.useMemo(
    () => [...orders].sort((a, b) => b.savedAt - a.savedAt).slice(0, 6),
    [orders],
  )
  const totalValue = orders.reduce((sum, o) => {
    return sum + o.data.orderContent.reduce((s, line) => s + line.total, 0)
  }, 0)

  return (
    <main className="rise-in page-wrap flex flex-col gap-5 px-4 pb-12 pt-6">
      <section className="rise-in flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Oversikt
          </div>
          <h1 className="font-heading text-2xl font-medium leading-tight">
            God dag — her er dagens bilde
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Raskt overblikk over ordrer, kunder og produkter. Start en ny
            bestilling eller hopp inn i arkivet for å skrive ut på nytt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/archive">Se arkiv</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/new">
              <FilePlusIcon className="size-4" />
              Ny ordre
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rise-in">
        <KpiCard
          label="Ordrer i arkiv"
          value={String(orders.length)}
          hint={`${deliveriesToday.length} leveres i dag`}
          icon={<CalendarClock className="size-4" />}
        />
        <KpiCard
          label="Samlet ordreverdi"
          value={nokFormatter.format(totalValue)}
          hint="Sum av aktive ordrer"
          icon={<TrendingUp className="size-4" />}
        />
        <KpiCard
          label="Kunder"
          value={customers ? String(customers.length) : '—'}
          hint="I kunderegister"
          icon={<IdCard className="size-4" />}
          to="/customers"
        />
        <KpiCard
          label="Produkter"
          value={products ? String(products.length) : '—'}
          hint="I produktkatalog"
          icon={<Package className="size-4" />}
          to="/products"
        />
      </section>

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
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 bg-muted/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <div>Dato</div>
                <div>Mottaker</div>
                <div>Tid</div>
                <div className="text-right">Sum</div>
              </div>
              <div className="divide-y">
                {upcoming.slice(0, 8).map((o) => {
                  const iso = shortDateToIso(o.data.delivery.shortDate)
                  const info = iso ? formatDeliveryDate(iso) : null
                  const sum = o.data.orderContent.reduce(
                    (s, l) => s + l.total,
                    0,
                  )
                  const isToday = iso === today
                  return (
                    <div
                      key={o.key}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">
                          {info?.shortDate ?? o.data.delivery.shortDate}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {info?.dayText}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">
                          {o.data.receiver.name || 'Uten navn'}
                        </span>
                        {o.data.receiver.address ? (
                          <span className="text-muted-foreground">
                            {' · '}
                            {o.data.receiver.address}
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {o.data.delivery.deliveryTime || '—'}
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-right font-mono text-xs">
                          {nokFormatter.format(sum)}
                        </span>
                        {isToday ? (
                          <span className="inline-flex items-center rounded-md border bg-accent/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-foreground">
                            I dag
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Siste ordrer
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
                <div key={o.key} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
                    {o.data.delivery.shortDate?.slice(0, 5) ?? '—'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {o.data.receiver.name || 'Uten navn'}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {o.data.orderContent.length} vare
                      {o.data.orderContent.length === 1 ? '' : 'r'}
                      {' · '}
                      lagret{' '}
                      {new Date(o.savedAt).toLocaleDateString('nb-NO', {
                        dateStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  to,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  to?: '/customers' | '/products'
}) {
  const body = (
    <div className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent/10">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="font-heading text-2xl font-medium">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  )
  if (to) return <Link to={to}>{body}</Link>
  return body
}

function shortDateToIso(short: string): string {
  // short format: "DD.MM.YYYY"
  if (!short) return ''
  const parts = short.split('.')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m}-${d}`
}
