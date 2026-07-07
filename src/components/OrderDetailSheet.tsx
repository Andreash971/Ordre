import * as React from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'

import type { ArchivedOrder } from '@shared/orders'
import { formatNok } from '@/lib/format'
import {
  isBusinessReceiver,
  isBusinessSender,
  orderReceiverLabel,
  orderReceiverRepresentative,
  orderSenderLabel,
  orderSenderRepresentative,
} from '@/lib/order-utils'
import { listMissingFields, orderMissingFields } from '@/lib/order-review'
import { OrderEditForm } from '@/components/OrderEditForm'
import { MissingFieldsBadge } from '@/components/MissingFieldsBadge'
import { NoticeBanner } from '@/components/NoticeBanner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import OpenOrderButton from '@/components/OpenOrderButton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const cardLabelClass =
  'font-mono text-xs uppercase tracking-wider text-muted-foreground'

function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className={`${cardLabelClass} mb-1`}>{title}</div>
      {children}
    </div>
  )
}

/** Address block for one order party (Mottaker/Avsender). */
function PartyCard({
  title,
  primary,
  representative,
  company,
  address,
  postCode,
  phone,
  flagMissing,
}: {
  title: string
  primary: string
  /** Contact person shown under a business's company name. */
  representative?: string
  /** Employer line for private customers. */
  company?: string
  address?: string
  postCode?: string
  phone?: string
  /** Badge review-blocking gaps (receiver only); otherwise hide empty lines. */
  flagMissing?: boolean
}) {
  return (
    <DetailCard title={title}>
      <div className="text-sm space-y-0.5">
        <div className="font-medium">{primary || '—'}</div>
        {representative ? (
          <div className="text-muted-foreground">v/ {representative}</div>
        ) : null}
        {company ? (
          <div className="text-muted-foreground">{company}</div>
        ) : null}
        {address ? (
          <div className="text-muted-foreground">{address}</div>
        ) : null}
        {postCode ? (
          <div className="text-muted-foreground">{postCode}</div>
        ) : null}
        {flagMissing && (!address || !postCode) ? (
          <div>
            <MissingFieldsBadge fields={['adresse']} />
          </div>
        ) : null}
        {phone ? (
          <div className="font-mono text-xs text-muted-foreground">{phone}</div>
        ) : flagMissing ? (
          <div>
            <MissingFieldsBadge fields={['telefon']} />
          </div>
        ) : null}
      </div>
    </DetailCard>
  )
}

function OrderDetail({
  order,
  onDelete,
}: {
  order: ArchivedOrder
  onDelete?: () => void
}) {
  const [current, setCurrent] = React.useState(order)
  const [mode, setMode] = React.useState<'view' | 'edit'>('view')
  const [ignored, setIgnored] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  // Reset when a different order is opened (but not after a local save,
  // where the parent still holds the pre-edit row).
  React.useEffect(() => {
    setCurrent(order)
    setMode('view')
    setIgnored(false)
  }, [order])

  const { data } = current
  const missing = orderMissingFields(current)
  const incomplete = missing.length > 0 && !ignored
  const items = data.orderContent
  const sum = items.reduce((s, l) => s + l.total, 0)

  const businessReceiver = isBusinessReceiver(current)
  const receiverTitle = orderReceiverLabel(current)
  // Business rows are company-first with the name as representative; hide
  // lines that would just repeat the primary line.
  const receiverRepresentative = orderReceiverRepresentative(current)
  const receiverCompany =
    !businessReceiver && data.receiver.company !== data.receiver.name
      ? data.receiver.company
      : undefined
  const businessSender = isBusinessSender(current)
  const senderTitle = orderSenderLabel(current)
  const senderRepresentative = orderSenderRepresentative(current)
  const senderCompany =
    !businessSender && data.sender.company !== data.sender.name
      ? data.sender.company
      : undefined

  if (mode === 'edit') {
    return (
      <OrderEditForm
        order={current}
        onCancel={() => setMode('view')}
        onSaved={(updated) => {
          setCurrent(updated)
          setMode('view')
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className={cardLabelClass}>
          {businessReceiver ? 'Ordre · Firmakunde' : 'Ordre'}
        </div>
        <SheetTitle className="font-heading text-xl">
          {receiverTitle}
        </SheetTitle>
        <SheetDescription>
          {data.delivery.dayText}, {data.delivery.longDate}
          {data.delivery.deliveryTime
            ? ` — kl. ${data.delivery.deliveryTime}`
            : ''}
        </SheetDescription>
      </SheetHeader>

      {missing.length > 0 && !ignored ? (
        <NoticeBanner
          tone="warning"
          title="Trenger gjennomgang"
          description={`Mangler ${listMissingFields(missing)}.`}
        >
          <Button
            variant="outline"
            size="sm"
            className="border-warning bg-transparent text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground"
            onClick={() => setIgnored(true)}
          >
            <Check className="size-3.5" />
            Ignorer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-warning bg-card text-warning-foreground hover:text-warning-foreground"
            onClick={() => setMode('edit')}
          >
            <Pencil className="size-3.5" />
            Fullfør
          </Button>
        </NoticeBanner>
      ) : null}
      {missing.length > 0 && ignored ? (
        <NoticeBanner
          tone="success"
          title="Markert som OK"
          description="Manglende felt er godkjent — ordren kan skrives ut."
        >
          <Button variant="outline" size="sm" onClick={() => setIgnored(false)}>
            Angre
          </Button>
        </NoticeBanner>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <PartyCard
          title={businessReceiver ? 'Mottaker · Firmakunde' : 'Mottaker'}
          primary={receiverTitle}
          representative={receiverRepresentative}
          company={receiverCompany}
          address={data.receiver.address}
          postCode={data.receiver.postCode}
          phone={data.receiver.phone}
          flagMissing
        />
        <PartyCard
          title={businessSender ? 'Avsender · Firmakunde' : 'Avsender'}
          primary={senderTitle}
          representative={senderRepresentative}
          company={senderCompany}
          address={data.sender.address}
          postCode={data.sender.postCode}
          phone={data.sender.phone}
        />
      </div>

      <DetailCard title="Leveringsvalg">
        <div className="text-sm text-muted-foreground">
          Ved dør: {data.delivery.deliveryLeaveDoor} · Til nabo:{' '}
          {data.delivery.deliveryLeaveNeighbour}
        </div>
      </DetailCard>

      {data.card.cardText ? (
        <DetailCard title="Korttekst">
          <div className="text-sm rounded-md border p-2 font-mono">
            {data.card.cardText}
          </div>
        </DetailCard>
      ) : null}

      {data.card.instructionsText ? (
        <DetailCard title="Spesielle instruksjoner">
          <div className="text-sm rounded-md border p-2">
            {data.card.instructionsText}
          </div>
        </DetailCard>
      ) : null}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className={cardLabelClass}>Vare</TableHead>
              <TableHead className={`${cardLabelClass} text-right`}>
                Pris/stk
              </TableHead>
              <TableHead className={`${cardLabelClass} text-right`}>
                Antall
              </TableHead>
              <TableHead className={`${cardLabelClass} text-right`}>
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
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatNok(line.price)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ×{line.quantity}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNok(line.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Totalt</span>
          <span className="text-right font-mono font-medium">
            {formatNok(sum)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-xs text-muted-foreground">
          Lagret{' '}
          {new Date(current.savedAt).toLocaleDateString('nb-NO', {
            dateStyle: 'medium',
          })}
          {' · '}
          {current.expiresAt === null
            ? 'Utløper aldri'
            : `Utløper ${new Date(current.expiresAt).toLocaleDateString(
                'nb-NO',
                { dateStyle: 'medium' },
              )}`}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Slett
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setMode('edit')}
            >
              <Pencil className="h-4 w-4" />
              Rediger
            </Button>
          </div>
          <OpenOrderButton storedOrder={current} disabled={incomplete} />
        </div>
      </div>

      {onDelete ? (
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Slett ordre?</DialogTitle>
              <DialogDescription>
                Er du sikker på at du vil slette denne ordren? Den vil bli
                slettet permanent og kan ikke gjenopprettes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Avbryt</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmDeleteOpen(false)
                  onDelete()
                }}
              >
                Slett
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}

export function OrderDetailSheet({
  order,
  onOpenChange,
  onDelete,
}: {
  order: ArchivedOrder | null
  onOpenChange: (open: boolean) => void
  onDelete?: () => void
}) {
  return (
    <Sheet open={order !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full lg:min-w-xl overflow-y-auto">
        {order ? <OrderDetail order={order} onDelete={onDelete} /> : null}
      </SheetContent>
    </Sheet>
  )
}
