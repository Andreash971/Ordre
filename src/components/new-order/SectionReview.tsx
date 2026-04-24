import { FileText, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import OpenOrderButton from '@/components/ui/open-order-button'
import type { Item } from '#/components/OrderColumns'
import { formatDeliveryDate } from '#/lib/order-utils'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '#/lib/order-utils'

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

const SPECIAL_ITEMS = new Set(['Frakt', 'Frakt Tidspunktstillegg', 'Kort'])

interface SectionReviewProps {
  sender: CustomerFormValues | null
  delivery: DeliveryValues
  items: Item[]
  recipients: Customer[]
  cardEnabled: boolean
  cardValue: string
  instructionsEnabled: boolean
  instructionsValue: string
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
  }
}

export default function SectionReview({
  sender,
  delivery,
  items,
  recipients,
  cardEnabled,
  cardValue,
  instructionsEnabled,
  instructionsValue,
}: SectionReviewProps) {
  const deliveryInfo = delivery.date ? formatDeliveryDate(delivery.date) : null
  const regularSubtotal = items
    .filter((i) => !SPECIAL_ITEMS.has(i.name))
    .reduce((s, i) => s + i.price * i.quantity, 0)
  const kort = items.find((i) => i.name === 'Kort')
  const leveringstid = items.find((i) => i.name === 'Frakt Tidspunktstillegg')
  const frakt = items.find((i) => i.name === 'Frakt')
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const vat = Math.round(total * 0.25)

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

  const senderValues = sender

  return (
    <div className="flex flex-col gap-4">
      {/* Top cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Fakturering
          </div>
          {sender ? (
            <div className="text-sm space-y-0.5">
              <div className="font-medium">{sender.name}</div>
              {sender.company ? (
                <div className="text-muted-foreground">{sender.company}</div>
              ) : null}
              {sender.address ? (
                <div className="text-muted-foreground">
                  {sender.address}
                  {sender.postcode || sender.city
                    ? `, ${[sender.postcode, sender.city].filter(Boolean).join(' ')}`
                    : ''}
                </div>
              ) : null}
              {sender.phone ? (
                <div className="text-muted-foreground font-mono text-xs">
                  {sender.phone}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ingen kunde valgt enda.
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Standard levering
          </div>
          {deliveryInfo ? (
            <div className="text-sm space-y-0.5">
              <div className="font-medium">{deliveryInfo.dayText}</div>
              <div className="text-muted-foreground">
                {deliveryInfo.longDate}
              </div>
              <div className="text-muted-foreground font-mono">
                {delivery.time ? `kl. ${delivery.time}` : 'Ingen tidspunkt'}
              </div>
              <div className="text-muted-foreground text-xs flex items-center gap-1.5 pt-1">
                <Users className="size-3.5" />
                <span>
                  {effectiveRecipients.length} mottaker
                  {effectiveRecipients.length === 1 ? '' : 'e'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ingen dato valgt.
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 bg-muted/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <div>Vare</div>
          <div className="text-right">Antall</div>
          <div className="text-right">Pris</div>
          <div className="text-right">Sum</div>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div
              key={item.name}
              className={cn(
                'grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2 text-sm',
                SPECIAL_ITEMS.has(item.name) && 'bg-accent/10',
              )}
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-right font-mono">×{item.quantity}</div>
              <div className="text-right font-mono text-muted-foreground">
                {nokFormatter.format(item.price)}
              </div>
              <div className="text-right font-mono">
                {nokFormatter.format(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {cardEnabled && cardValue ? (
        <div className="rounded-lg border p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Kortmelding
          </div>
          <div className="rounded-md bg-[#f4ece0] text-[#1d1714] font-serif text-base leading-relaxed p-4 whitespace-pre-wrap shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            {cardValue}
          </div>
        </div>
      ) : null}

      {instructionsEnabled && instructionsValue ? (
        <div className="rounded-lg border p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Spesielle instruksjoner
          </div>
          <div className="text-sm whitespace-pre-wrap">{instructionsValue}</div>
        </div>
      ) : null}

      {/* Recipient cards */}
      {effectiveRecipients.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Mottakere ({effectiveRecipients.length})
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {effectiveRecipients.map((r, i) => {
              const rDate = r.date || delivery.date
              const rTime = r.time ?? delivery.time
              const rCard = cardEnabled
                ? r.cardmsg || cardValue
                : ''
              const rNotes = instructionsEnabled
                ? r.instructmsg || instructionsValue
                : ''
              const dateInfo = rDate ? formatDeliveryDate(rDate) : null
              const dateOverride = Boolean(r.date && r.date !== delivery.date)
              const timeOverride = r.time !== null && r.time !== delivery.time
              const cardOverride = cardEnabled && r.cardmsg && r.cardmsg !== cardValue
              const notesOverride =
                instructionsEnabled &&
                r.instructmsg &&
                r.instructmsg !== instructionsValue
              return (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-muted font-mono text-[10px]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="font-medium truncate">
                      {r.name || `Mottaker ${i + 1}`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <ReviewCell
                      label="Dato"
                      value={dateInfo?.shortDate ?? '—'}
                      highlight={dateOverride}
                    />
                    <ReviewCell
                      label="Tid"
                      value={rTime ?? '—'}
                      highlight={timeOverride}
                    />
                    <ReviewCell
                      label="Kort"
                      value={rCard ? '✓ kortmelding' : '—'}
                      highlight={Boolean(cardOverride)}
                    />
                    <ReviewCell
                      label="Instruks"
                      value={rNotes ? '✓ instruks' : '—'}
                      highlight={Boolean(notesOverride)}
                    />
                  </div>
                  {r.address ? (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      {r.address}
                      {r.postcode || r.city
                        ? `, ${[r.postcode, r.city].filter(Boolean).join(' ')}`
                        : ''}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Totals */}
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <div className="text-muted-foreground">Produkter</div>
          <div className="text-right font-mono">
            {nokFormatter.format(regularSubtotal)}
          </div>
          {kort ? (
            <>
              <div className="text-muted-foreground">Kortmelding</div>
              <div className="text-right font-mono">
                {nokFormatter.format(kort.price * kort.quantity)}
              </div>
            </>
          ) : null}
          {leveringstid ? (
            <>
              <div className="text-muted-foreground">Leveringstid</div>
              <div className="text-right font-mono">
                {nokFormatter.format(leveringstid.price * leveringstid.quantity)}
              </div>
            </>
          ) : null}
          {frakt ? (
            <>
              <div className="text-muted-foreground">Frakt</div>
              <div className="text-right font-mono">
                {nokFormatter.format(frakt.price * frakt.quantity)}
              </div>
            </>
          ) : null}
          <div className="text-muted-foreground">MVA (25%, inkl.)</div>
          <div className="text-right font-mono text-muted-foreground">
            {nokFormatter.format(vat)}
          </div>
          <div className="col-span-2 border-t my-2" />
          <div className="font-medium">Totalt</div>
          <div className="text-right font-mono font-medium">
            {nokFormatter.format(total)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <OpenOrderButton
            customers={effectiveRecipients}
            senderValues={senderValues}
            deliveryValues={delivery}
            items={items}
          />
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3" />
          <span>
            Genererer {effectiveRecipients.length || 0} ordrelapp
            {effectiveRecipients.length === 1 ? '' : 'er'}
          </span>
        </div>
      </div>
    </div>
  )
}

function ReviewCell({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-md border px-2 py-1.5',
        highlight && 'border-primary/50 bg-accent/10',
      )}
    >
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="truncate font-medium">{value}</div>
    </div>
  )
}
