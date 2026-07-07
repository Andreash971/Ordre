import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CalendarIcon,
  Hash,
  Info,
  MapPin,
  MessageSquarePlus,
  Phone,
  Save,
  StickyNote,
  TriangleAlert,
  User,
  X,
} from 'lucide-react'

import type {
  ArchivedOrder,
  OrderData,
  OrderSender,
  UpdatedArchivedOrder,
} from '@shared/orders'
import {
  buildOrderData,
  isBusinessReceiver,
  isBusinessSender,
  orderReceiverLabel,
} from '@/lib/order-utils'
import { listMissingFields } from '@/lib/order-review'
import { updateOrder } from '@/lib/order-server-fns'
import { queryKeys } from '@/lib/query-keys'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { TimePicker } from '@/components/ui/time-picker'
import { IconInputField, IconReadField } from '@/components/IconField'
import { NoticeBanner } from '@/components/NoticeBanner'
import { EmptyButton } from '@/components/ui/empty-button'
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatNok } from '@/lib/format'

type OrderDraft = {
  phone: string
  address: string
  postcode: string
  city: string
  senderName: string
  senderPhone: string
  senderAddress: string
  senderPostcode: string
  senderCity: string
  time: string | null
  leaveDoor: boolean
  leaveNeighbour: boolean
  cardText: string
  instructions: string
}

/** Split the combined print-data field "0257 Oslo" into zip + city. */
function splitPostCode(value: string): [string, string] {
  const m = value.trim().match(/^(\d{4})\s*(.*)$/)
  return m ? [m[1], m[2]] : ['', value.trim()]
}

function draftFromOrder(order: ArchivedOrder): OrderDraft {
  const src = order.source
  if (src) {
    return {
      phone: src.customer.phone,
      address: src.customer.address,
      postcode: src.customer.postcode,
      city: src.customer.city,
      senderName: src.sender?.name ?? '',
      senderPhone: src.sender?.phone ?? '',
      senderAddress: src.sender?.address ?? '',
      senderPostcode: src.sender?.postcode ?? '',
      senderCity: src.sender?.city ?? '',
      time: src.customer.time ?? src.delivery.time,
      leaveDoor: src.customer.leaveDoor,
      leaveNeighbour: src.customer.leaveNeighbour,
      cardText: src.customer.cardmsg,
      instructions: src.customer.instructmsg,
    }
  }
  const { data } = order
  const [postcode, city] = splitPostCode(data.receiver.postCode)
  const [senderPostcode, senderCity] = splitPostCode(data.sender.postCode)
  return {
    phone: data.receiver.phone,
    address: data.receiver.address,
    postcode,
    city,
    senderName: data.sender.name,
    senderPhone: data.sender.phone,
    senderAddress: data.sender.address,
    senderPostcode,
    senderCity,
    time: data.delivery.deliveryTime || null,
    leaveDoor: data.delivery.deliveryLeaveDoor === 'Ja',
    leaveNeighbour: data.delivery.deliveryLeaveNeighbour === 'Ja',
    cardText: data.card.cardText,
    instructions: data.card.instructionsText,
  }
}

function buildUpdatePayload(
  order: ArchivedOrder,
  draft: OrderDraft,
): UpdatedArchivedOrder {
  if (order.source) {
    const customer = {
      ...order.source.customer,
      phone: draft.phone,
      address: draft.address,
      postcode: draft.postcode,
      city: draft.city,
      time: draft.time,
      leaveDoor: draft.leaveDoor,
      leaveNeighbour: draft.leaveNeighbour,
      cardmsg: draft.cardText,
      instructmsg: draft.instructions,
    }
    const hasSender =
      order.source.sender !== null ||
      Boolean(draft.senderName || draft.senderPhone || draft.senderAddress)
    const sender: OrderSender | null = hasSender
      ? {
          company: '',
          careof: '',
          ...order.source.sender,
          name: draft.senderName,
          phone: draft.senderPhone,
          address: draft.senderAddress,
          postcode: draft.senderPostcode,
          city: draft.senderCity,
        }
      : null
    const source = { ...order.source, customer, sender }
    return {
      id: order.id,
      source,
      data: buildOrderData(customer, sender, source.delivery, source.items),
    }
  }

  // Legacy row without the raw draft: patch the print data directly.
  const data: OrderData = {
    ...order.data,
    delivery: {
      ...order.data.delivery,
      deliveryTime: draft.time ?? '',
      deliveryLeaveDoor: draft.leaveDoor ? 'Ja' : 'Nei',
      deliveryLeaveNeighbour: draft.leaveNeighbour ? 'Ja' : 'Nei',
    },
    sender: {
      ...order.data.sender,
      name: draft.senderName,
      phone: draft.senderPhone,
      address: draft.senderAddress,
      postCode: `${draft.senderPostcode} ${draft.senderCity}`.trim(),
    },
    receiver: {
      ...order.data.receiver,
      phone: draft.phone,
      address: draft.address,
      postCode: `${draft.postcode} ${draft.city}`.trim(),
    },
    card: {
      cardText: draft.cardText,
      instructionsText: draft.instructions,
    },
  }
  return { id: order.id, source: null, data }
}

function EditSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <div className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  )
}

export function OrderEditForm({
  order,
  onCancel,
  onSaved,
}: {
  order: ArchivedOrder
  onCancel: () => void
  onSaved: (updated: ArchivedOrder) => void
}) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = React.useState<OrderDraft>(() =>
    draftFromOrder(order),
  )
  const [showInstructions, setShowInstructions] = React.useState(() =>
    Boolean(draft.instructions),
  )
  const [showCard, setShowCard] = React.useState(() => Boolean(draft.cardText))
  const [saving, setSaving] = React.useState(false)

  const set = <TKey extends keyof OrderDraft>(
    key: TKey,
    value: OrderDraft[TKey],
  ) => setDraft((d) => ({ ...d, [key]: value }))

  const issues: string[] = []
  if (!draft.phone.trim()) issues.push('telefon')
  if (!draft.address.trim() || !draft.postcode.trim() || !draft.city.trim())
    issues.push('adresse')
  const done = issues.length === 0

  const { data } = order
  const items = data.orderContent
  // Business rows are company-first; mirror the view-mode title.
  const businessReceiver = isBusinessReceiver(order)
  const businessSender = isBusinessSender(order)
  const receiverTitle = orderReceiverLabel(order)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = buildUpdatePayload(order, draft)
      const updated = await updateOrder({ data: payload })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      onSaved(
        updated ?? { ...order, source: payload.source, data: payload.data },
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Ordre · gjennomgang
        </div>
        <SheetTitle className="font-heading text-xl">
          {receiverTitle}
        </SheetTitle>
        <SheetDescription>
          {data.delivery.dayText}, {data.delivery.longDate}
          {draft.time ? ` — kl. ${draft.time}` : ''}
        </SheetDescription>
      </SheetHeader>

      {done ? (
        <NoticeBanner
          tone="success"
          title="Alt er fylt ut"
          description="Ordren er klar til å skrives ut."
        />
      ) : (
        <NoticeBanner
          tone="warning"
          title={`${issues.length} felt mangler`}
          description={`Fyll inn ${listMissingFields(issues)} for å fullføre ordren.`}
        />
      )}

      <EditSection
        title={businessReceiver ? 'Mottaker · Firmakunde' : 'Mottaker'}
      >
        <div className="flex flex-col gap-3">
          {businessReceiver ? (
            <>
              <IconReadField label="Firma" icon={<Building2 />}>
                {data.receiver.company}
              </IconReadField>
              {data.receiver.name &&
              data.receiver.name !== data.receiver.company ? (
                <IconReadField label="Representant" icon={<User />}>
                  v/ {data.receiver.name}
                </IconReadField>
              ) : null}
            </>
          ) : (
            <IconReadField label="Navn" icon={<User />}>
              {data.receiver.name || '—'}
            </IconReadField>
          )}
          <IconInputField
            label="Telefon"
            icon={<Phone />}
            value={draft.phone}
            onChange={(v) => set('phone', v)}
            placeholder="+47"
            missing={!draft.phone.trim()}
            mono
            type="tel"
          />
          <IconInputField
            label="Gate og husnummer"
            icon={<MapPin />}
            value={draft.address}
            onChange={(v) => set('address', v)}
            placeholder="F.eks. Frognerveien 11"
            missing={!draft.address.trim()}
          />
          <div className="grid grid-cols-2 gap-3">
            <IconInputField
              label="Postnummer"
              icon={<Hash />}
              value={draft.postcode}
              onChange={(v) => set('postcode', v)}
              placeholder="0000"
              missing={!draft.postcode.trim()}
              mono
            />
            <IconInputField
              label="Sted"
              icon={<Building2 />}
              value={draft.city}
              onChange={(v) => set('city', v)}
              placeholder="F.eks. Oslo"
              missing={!draft.city.trim()}
            />
          </div>
        </div>
      </EditSection>

      <EditSection
        title={businessSender ? 'Avsender · Firmakunde' : 'Avsender'}
      >
        <div className="flex flex-col gap-3">
          {businessSender ? (
            <IconReadField label="Firma" icon={<Building2 />}>
              {data.sender.company}
            </IconReadField>
          ) : null}
          <IconInputField
            label={businessSender ? 'Representant' : 'Navn'}
            icon={<User />}
            value={draft.senderName}
            onChange={(v) => set('senderName', v)}
            placeholder={businessSender ? 'Representant' : 'Navn'}
          />
          <IconInputField
            label="Telefon"
            icon={<Phone />}
            value={draft.senderPhone}
            onChange={(v) => set('senderPhone', v)}
            placeholder="+47"
            mono
            type="tel"
          />
          <IconInputField
            label="Gate og husnummer"
            icon={<MapPin />}
            value={draft.senderAddress}
            onChange={(v) => set('senderAddress', v)}
            placeholder="F.eks. Frognerveien 11"
          />
          <div className="grid grid-cols-2 gap-3">
            <IconInputField
              label="Postnummer"
              icon={<Hash />}
              value={draft.senderPostcode}
              onChange={(v) => set('senderPostcode', v)}
              placeholder="0000"
              mono
            />
            <IconInputField
              label="Sted"
              icon={<Building2 />}
              value={draft.senderCity}
              onChange={(v) => set('senderCity', v)}
              placeholder="F.eks. Oslo"
            />
          </div>
        </div>
      </EditSection>

      <EditSection title="Levering">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <IconReadField label="Dato" icon={<CalendarIcon />}>
              {data.delivery.longDate}
            </IconReadField>
            <TimePicker
              value={draft.time}
              onChange={(v) => set('time', v)}
              allowNull
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.leaveDoor}
                onCheckedChange={(v) => set('leaveDoor', v === true)}
              />
              Kan settes igjen ved dør
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.leaveNeighbour}
                onCheckedChange={(v) => set('leaveNeighbour', v === true)}
              />
              Kan leveres til nabo
            </label>
          </div>
        </div>
      </EditSection>

      <EditSection title="Instrukser og kort">
        <div className="flex flex-col gap-4">
          {showCard ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kort</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setShowCard(false)
                    set('cardText', '')
                  }}
                  aria-label="Fjern kort"
                >
                  <X />
                </Button>
              </div>
              <Textarea
                value={draft.cardText}
                autoFocus={!draft.cardText}
                onChange={(e) => set('cardText', e.target.value)}
                placeholder="Skriv en hilsen til mottaker"
                className="min-h-[70px] font-mono text-sm"
              />
            </div>
          ) : (
            <EmptyButton
              icon={<MessageSquarePlus />}
              title="Legg til kort"
              description="Kort er ikke en del av ordren."
              onClick={() => setShowCard(true)}
            />
          )}
          {showInstructions ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Instrukser</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setShowInstructions(false)
                    set('instructions', '')
                  }}
                  aria-label="Fjern instrukser"
                >
                  <X />
                </Button>
              </div>
              <Textarea
                value={draft.instructions}
                autoFocus={!draft.instructions}
                onChange={(e) => set('instructions', e.target.value)}
                placeholder="F.eks. «Ring før ankomst», «Sett på trappen hvis ingen åpner»"
                className="min-h-[70px] text-sm"
              />
            </div>
          ) : (
            <EmptyButton
              icon={<StickyNote />}
              title="Legg til instrukser"
              description="Instrukser er ikke en del av ordren."
              onClick={() => setShowInstructions(true)}
            />
          )}
        </div>
      </EditSection>

      <EditSection title="Varer">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5" />
          Ordrens innhold kan ikke endres her.
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableBody>
              {items.map((line, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{line.product}</TableCell>
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
      </EditSection>

      <div className="flex items-center justify-between gap-4 border-t pt-4">
        {done ? (
          <span className="text-xs text-muted-foreground">
            Klar til utskrift
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-warning-foreground">
            <TriangleAlert className="size-3.5" />
            {issues.length} felt gjenstår
          </span>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={onCancel}>
            Avbryt
          </Button>
          <Button size="lg" disabled={!done || saving} onClick={handleSave}>
            <Save className="size-4" />
            {saving ? 'Lagrer…' : 'Lagre endringer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
