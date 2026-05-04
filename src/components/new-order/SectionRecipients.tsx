import * as React from 'react'
import { nb } from 'date-fns/locale'
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  StickyNote,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { EmptyButton } from '@/components/ui/empty-button'
import { cn } from '@/lib/utils'

import CustomerForm from '#/components/CustomerForm'
import { formatDeliveryDate } from '#/lib/order-utils'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '#/lib/order-utils'

interface SectionRecipientsProps {
  recipients: Customer[]
  onRecipientsChange: React.Dispatch<React.SetStateAction<Customer[]>>
  defaults: {
    delivery: DeliveryValues
    showTime: boolean
    cardEnabled: boolean
    cardValue: string
    instructionsEnabled: boolean
    instructionsValue: string
  }
}

const emptyRecipient = (): Customer => ({
  name: '',
  phone: '',
  company: '',
  address: '',
  postcode: '',
  city: '',
  careof: '',
  cardmsg: '',
  instructmsg: '',
  date: '',
  time: null,
})

function toIso(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function SectionRecipients({
  recipients,
  onRecipientsChange,
  defaults,
}: SectionRecipientsProps) {
  const [expanded, setExpanded] = React.useState<number | null>(0)

  const addRecipient = () => {
    const nextIndex = recipients.length
    const next: Customer = {
      ...emptyRecipient(),
      date: defaults.delivery.date,
      time: defaults.delivery.time,
      cardmsg: defaults.cardEnabled ? defaults.cardValue : '',
      instructmsg: defaults.instructionsEnabled
        ? defaults.instructionsValue
        : '',
    }
    onRecipientsChange((prev) => [...prev, next])
    setExpanded(nextIndex)
  }

  const removeRecipient = (index: number) => {
    onRecipientsChange((prev) => prev.filter((_, i) => i !== index))
    setExpanded(null)
  }

  const updateRecipient = (index: number, patch: Partial<Customer>) => {
    onRecipientsChange((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    )
  }

  function titleButton() {
    return (
      <p className="flex items-center gap-2">
        <UserPlus size={16} /> Legg til mottaker
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {recipients.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>Ingen mottakere</EmptyTitle>
            <EmptyDescription>
              Når det ikke er noen mottakere settes avsenderen som mottaker.
            </EmptyDescription>
            <EmptyContent>
              <Button type="button" variant="default" onClick={addRecipient}>
                <UserPlus />
                Legg til mottaker
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : null}

      {recipients.map((r, i) => (
        <RecipientRow
          key={i}
          index={i}
          value={r}
          expanded={expanded === i}
          onExpand={() => setExpanded(expanded === i ? null : i)}
          onChange={(patch) => updateRecipient(i, patch)}
          onRemove={() => removeRecipient(i)}
          defaults={defaults}
        />
      ))}

      {recipients.length >= 1 ? (
        <EmptyButton
          title={titleButton()}
          onClick={addRecipient}
          className="max-h-16"
        />
      ) : null}
    </div>
  )
}

interface RecipientRowProps {
  index: number
  value: Customer
  expanded: boolean
  onExpand: () => void
  onChange: (patch: Partial<Customer>) => void
  onRemove: () => void
  defaults: SectionRecipientsProps['defaults']
}

function RecipientRow({
  index,
  value,
  expanded,
  onExpand,
  onChange,
  onRemove,
  defaults,
}: RecipientRowProps) {
  const summaryDate = value.date || defaults.delivery.date
  const formattedDate = summaryDate ? formatDeliveryDate(summaryDate) : null

  const customerDefaults: Partial<CustomerFormValues> = {
    name: value.name,
    phone: value.phone,
    company: value.company,
    address: value.address,
    postcode: value.postcode,
    city: value.city,
    careof: value.careof,
  }

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={onExpand}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-muted font-mono text-xs">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {value.name || `Mottaker ${index + 1}`}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {formattedDate?.shortDate ?? '—'} · {value.time ?? '—'} ·{' '}
            {value.address || '—'}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded ? (
        <div className="grid grid-cols-[15rem_1fr] grid-rows-[auto_auto] border-t px-4 pb-4 pt-4 gap-4">
          <CustomerForm
            bare
            size="sm"
            showCareof
            defaultValues={customerDefaults}
            onValuesChange={(v) => onChange(v)}
          />

          {/* Overrides */}
          <div className="grid grid-cols-[1fr_1fr] grid-rows-[auto_1fr] gap-4">
            <OverrideDate
              value={value.date}
              fallback={defaults.delivery.date}
              onChange={(d) => onChange({ date: d })}
            />
            <OverrideTime
              value={value.time}
              fallback={defaults.delivery.time}
              onChange={(t) => onChange({ time: t })}
              disabled={!defaults.showTime}
            />
            <OverrideText
              label="Korttekst"
              placeholder="Kortteksten er tom."
              value={value.cardmsg}
              fallback={defaults.cardEnabled ? defaults.cardValue : ''}
              onChange={(v) => onChange({ cardmsg: v })}
              disabled={!defaults.cardEnabled && !value.cardmsg}
              hint={
                !defaults.cardEnabled
                  ? 'Legg til kort i ordren for å redigere den per mottaker.'
                  : undefined
              }
            />
            <OverrideText
              label="Instrukser"
              placeholder="Ingen instrukser for denne mottakeren."
              value={value.instructmsg}
              fallback={
                defaults.instructionsEnabled ? defaults.instructionsValue : ''
              }
              onChange={(v) => onChange({ instructmsg: v })}
              disabled={!defaults.instructionsEnabled && !value.instructmsg}
              hint={
                !defaults.instructionsEnabled
                  ? 'Legg til instrukser i ordren for å redigere den per mottaker.'
                  : undefined
              }
            />
          </div>

          <div className="col-span-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive"
            >
              <Trash2 />
              Fjern mottaker
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OverrideDate({
  value,
  fallback,
  onChange,
}: {
  value: string
  fallback: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const effective = value || fallback
  const formatted = effective ? formatDeliveryDate(effective) : null
  const isOverride = Boolean(value) && value !== fallback

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3',
        isOverride && 'border-primary/50 bg-accent/10',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Leveringsdato
        </div>
        {isOverride ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            Nullstill
          </Button>
        ) : null}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="justify-start gap-2 font-normal"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {formatted ? formatted.fullDate : 'Velg dato'}
            {isOverride ? (
              <span className="ml-auto text-[10px] font-mono uppercase text-primary">
                Overstyrt
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={nb}
            weekStartsOn={1}
            selected={effective ? new Date(effective + 'T00:00:00') : undefined}
            onSelect={(d) => {
              if (d) {
                onChange(toIso(d))
                setOpen(false)
              }
            }}
            disabled={(d) => {
              const t = new Date()
              t.setHours(0, 0, 0, 0)
              return d < t
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function OverrideTime({
  value,
  fallback,
  onChange,
  disabled = false,
  hint,
}: {
  value: string | null
  fallback: string | null
  onChange: (v: string | null) => void
  disabled?: boolean
  hint?: string
}) {
  const isOverride = value !== fallback

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3',
        isOverride && !disabled && 'border-primary/50 bg-accent/10',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Leveringstid
        </div>
        {isOverride && !disabled ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(fallback)}
          >
            Nullstill
          </Button>
        ) : null}
      </div>
      <TimePicker
        value={value}
        onChange={onChange}
        allowNull
        disabled={disabled}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function OverrideText({
  icon,
  label,
  placeholder,
  value,
  fallback,
  onChange,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  fallback: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const isOverride = value !== fallback
  return (
    <div
      className={cn(
        'flex flex-col gap-2 min-h-full rounded-lg border p-3',
        isOverride && 'border-primary/50 bg-accent/10',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        {isOverride ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(fallback)}
          >
            Bruk felles
          </Button>
        ) : null}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 resize-none"
      />
    </div>
  )
}
