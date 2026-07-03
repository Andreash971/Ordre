import * as React from 'react'
import { FileText, Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatNok } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import OpenOrderButton from '@/components/OpenOrderButton'
import type { Item } from '@/components/OrderColumns'
import { formatDeliveryDate } from '@/lib/order-utils'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '@/lib/order-utils'
import { getSpecialKeyForItem, isSpecial } from '@/lib/special-items'

const nok = formatNok

interface OrderProofProps {
  sender: CustomerFormValues | null
  delivery: DeliveryValues
  items: Item[]
  recipients: Customer[]
  cardEnabled: boolean
  cardValue: string
  instructionsEnabled: boolean
  instructionsValue: string
  beforeSubmit?: () => Promise<boolean>
}

function customerFromSender(
  sender: CustomerFormValues,
  delivery: DeliveryValues,
  card: string,
  instructions: string,
): Customer {
  return {
    name: sender.name,
    phone: sender.phone,
    company: sender.company,
    address: sender.address,
    postcode: sender.postcode,
    city: sender.city,
    careof: sender.careof,
    cardmsg: card,
    instructmsg: instructions,
    date: delivery.date,
    time: delivery.time,
    leaveDoor: delivery.leaveDoor,
    leaveNeighbour: delivery.leaveNeighbour,
  }
}

function formatAddress(c: { address: string; postcode: string; city: string }) {
  if (!c.address) return ''
  const tail = [c.postcode, c.city].filter(Boolean).join(' ')
  return tail ? `${c.address}, ${tail}` : c.address
}

const HIGHLIGHT = 'border border-primary bg-primary/10'

export default function OrderProof({
  sender,
  delivery,
  items,
  recipients,
  cardEnabled,
  cardValue,
  instructionsEnabled,
  instructionsValue,
  beforeSubmit,
}: OrderProofProps) {
  const regularItems = items.filter((i) => !isSpecial(i))
  const regularSubtotal = regularItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  )
  const kort = items.find((i) => getSpecialKeyForItem(i) === 'kort')
  const leveringstid = items.find(
    (i) => getSpecialKeyForItem(i) === 'leveringstid',
  )
  const frakt = items.find((i) => getSpecialKeyForItem(i) === 'frakt')
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const effectiveRecipients: Customer[] = recipients.length
    ? recipients
    : sender
      ? [
          customerFromSender(
            sender,
            delivery,
            cardEnabled ? cardValue : '',
            instructionsEnabled ? instructionsValue : '',
          ),
        ]
      : []

  const breakdown = [
    `Varer ${nok(regularSubtotal)}`,
    kort ? `kort ${nok(kort.price * kort.quantity)}` : null,
    leveringstid
      ? `tid ${nok(leveringstid.price * leveringstid.quantity)}`
      : null,
    frakt ? `frakt ${nok(frakt.price * frakt.quantity)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-muted p-5">
      {/* Billing + shared contents ticket */}
      <div className="grid gap-6 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Fakturering · kunde
          </div>
          {sender ? (
            <div className="mt-2 space-y-0.5 text-sm">
              <div className="font-medium">{sender.name || 'Uten navn'}</div>
              {sender.company ? (
                <div className="text-muted-foreground">{sender.company}</div>
              ) : null}
              {formatAddress(sender) ? (
                <div className="text-muted-foreground">
                  {formatAddress(sender)}
                </div>
              ) : null}
              {sender.phone ? (
                <div className="font-mono text-xs text-muted-foreground">
                  {sender.phone}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">
              Ingen kunde valgt enda.
            </div>
          )}
        </div>

        <div className="sm:border-l sm:pl-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Ordreinnhold · likt for alle
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {regularItems.length > 0 ? (
              regularItems.map((item, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span className="truncate">
                    {item.name || 'Uten navn'}{' '}
                    <span className="text-muted-foreground">
                      ×{item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono">
                    {nok(item.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">Ingen varer.</div>
            )}
            <div className="mt-1 flex justify-between gap-3 border-t pt-1 font-medium">
              <span>Sum varer</span>
              <span className="font-mono">{nok(regularSubtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-recipient slips */}
      {effectiveRecipients.map((r, i) => (
        <OrderSlip
          key={i}
          r={r}
          i={i}
          n={effectiveRecipients.length}
          delivery={delivery}
          cardEnabled={cardEnabled}
          cardValue={cardValue}
          instructionsEnabled={instructionsEnabled}
          instructionsValue={instructionsValue}
        />
      ))}

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-md">
        <div>
          <div className="font-medium">Totalt {nok(total)}</div>
          <div className="text-xs text-muted-foreground">{breakdown}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <OpenOrderButton
            customers={effectiveRecipients}
            senderValues={sender}
            deliveryValues={delivery}
            items={items}
            beforeSubmit={beforeSubmit}
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3" />
            <span>
              Genererer {effectiveRecipients.length || 0} ordrelapp
              {effectiveRecipients.length === 1 ? '' : 'er'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderSlip({
  r,
  i,
  n,
  delivery,
  cardEnabled,
  cardValue,
  instructionsEnabled,
  instructionsValue,
}: {
  r: Customer
  i: number
  n: number
  delivery: DeliveryValues
  cardEnabled: boolean
  cardValue: string
  instructionsEnabled: boolean
  instructionsValue: string
}) {
  const rDate = r.date || delivery.date
  const rTime = r.time
  const rCard = cardEnabled ? r.cardmsg || cardValue : ''
  const rNotes = instructionsEnabled ? r.instructmsg || instructionsValue : ''
  const dateInfo = rDate ? formatDeliveryDate(rDate) : null

  const dateOverride = Boolean(r.date && r.date !== delivery.date)
  const timeOverride = r.time !== delivery.time
  const cardOverride = Boolean(
    cardEnabled && r.cardmsg && r.cardmsg !== cardValue,
  )
  const notesOverride = Boolean(
    instructionsEnabled && r.instructmsg && r.instructmsg !== instructionsValue,
  )
  const doorOverride = r.leaveDoor !== delivery.leaveDoor
  const neighbourOverride = r.leaveNeighbour !== delivery.leaveNeighbour

  const count = [
    dateOverride,
    timeOverride,
    doorOverride,
    neighbourOverride,
    cardOverride,
    notesOverride,
  ].filter(Boolean).length

  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-sm">
      <div className="grid gap-6 border-b bg-muted/40 p-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Ordrelapp {i + 1} av {n}
            </span>
            {count ? (
              <Badge
                variant="soft"
                className="font-mono text-[10px] uppercase tracking-wider"
              >
                {count} endret felt
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="font-mono text-[10px] uppercase tracking-wider"
              >
                Alt felles
              </Badge>
            )}
          </div>
          <div className="mt-1 font-heading text-base font-medium">
            {r.name || `Mottaker ${i + 1}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {[formatAddress(r), r.phone].filter(Boolean).join(' · ') ||
              'Ingen adresse'}
          </div>
        </div>
        <div
          className={cn(
            'sm:border-l sm:pl-6',
            (dateOverride || timeOverride) && `rounded ${HIGHLIGHT} p-2`,
          )}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Leveres
          </div>
          <div className="font-medium mt-1">{dateInfo?.longDate ?? '—'}</div>
          <div className="font-mono text-xs text-muted-foreground">
            {rTime ? `kl. ${rTime}` : 'Ingen fast tid'}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-4 [grid-template-columns:max-content_1fr_1fr]">
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Leveringsvalg
          </div>
          <div
            className={cn(
              'flex flex-wrap gap-1.5',
              (doorOverride || neighbourOverride) &&
                `rounded ${HIGHLIGHT} p-1.5`,
            )}
          >
            {r.leaveDoor ? <Chip>Ved dør</Chip> : null}
            {r.leaveNeighbour ? <Chip>Til nabo</Chip> : null}
            {!r.leaveDoor && !r.leaveNeighbour ? (
              <span className="text-xs text-muted-foreground">Ingen</span>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Instrukser
          </div>
          {rNotes ? (
            <div
              className={cn(
                'text-sm leading-relaxed',
                notesOverride && `rounded ${HIGHLIGHT} p-2`,
              )}
            >
              {rNotes}
            </div>
          ) : (
            <NotIncluded message="Ingen instrukser for denne mottakeren." />
          )}
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Kort
          </div>
          {rCard ? (
            <div
              className={cn(
                'font-serif text-base leading-relaxed',
                cardOverride && `rounded ${HIGHLIGHT} p-2`,
              )}
            >
              {rCard}
            </div>
          ) : (
            <NotIncluded message="Ikke noe kort for denne mottakeren." />
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border bg-card px-2.5 text-[11px]">
      {children}
    </span>
  )
}

function NotIncluded({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs italic text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
