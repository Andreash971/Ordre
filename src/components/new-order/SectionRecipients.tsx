import * as React from 'react'
import { nb } from 'date-fns/locale'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { insertCustomer, updateCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '#/lib/order-utils'

interface SectionRecipientsProps {
  recipients: Customer[]
  onRecipientsChange: React.Dispatch<React.SetStateAction<Customer[]>>
  onRecipientIdsChange: React.Dispatch<
    React.SetStateAction<(number | null)[]>
  >
  autoSaveCustomer: boolean
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
  leaveDoor: false,
  leaveNeighbour: false,
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
  onRecipientIdsChange,
  autoSaveCustomer,
  defaults,
}: SectionRecipientsProps) {
  const [expanded, setExpanded] = React.useState<number | null>(0)
  const queryClient = useQueryClient()
  const saveCustomerMutation = useMutation({
    mutationFn: async ({
      values,
      id,
    }: {
      values: CustomerFormValues
      id: number | null
    }) => {
      if (id != null) {
        await updateCustomer({ data: { id, ...values } })
      } else {
        await insertCustomer({ data: values })
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })
  const saveCustomer = (
    values: CustomerFormValues,
    ctx: { id: number | null },
  ) => saveCustomerMutation.mutateAsync({ values, id: ctx.id })

  const addRecipient = () => {
    const nextIndex = recipients.length
    const next: Customer = {
      ...emptyRecipient(),
      date: defaults.delivery.date,
      time: defaults.delivery.time,
      leaveDoor: defaults.delivery.leaveDoor,
      leaveNeighbour: defaults.delivery.leaveNeighbour,
      cardmsg: defaults.cardEnabled ? defaults.cardValue : '',
      instructmsg: defaults.instructionsEnabled
        ? defaults.instructionsValue
        : '',
    }
    onRecipientsChange((prev) => [...prev, next])
    onRecipientIdsChange((prev) => [...prev, null])
    setExpanded(nextIndex)
  }

  const removeRecipient = (index: number) => {
    onRecipientsChange((prev) => prev.filter((_, i) => i !== index))
    onRecipientIdsChange((prev) => prev.filter((_, i) => i !== index))
    setExpanded(null)
  }

  const updateRecipient = (index: number, patch: Partial<Customer>) => {
    onRecipientsChange((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    )
  }

  const updateRecipientId = (index: number, id: number | null) => {
    onRecipientIdsChange((prev) =>
      prev.map((existing, i) => (i === index ? id : existing)),
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
          onSaveCustomer={saveCustomer}
          onIdChange={(id) => updateRecipientId(i, id)}
          hideSaveButton={autoSaveCustomer}
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
  onSaveCustomer: (
    values: CustomerFormValues,
    ctx: { id: number | null },
  ) => Promise<void>
  onIdChange: (id: number | null) => void
  hideSaveButton: boolean
  defaults: SectionRecipientsProps['defaults']
}

function RecipientRow({
  index,
  value,
  expanded,
  onExpand,
  onChange,
  onRemove,
  onSaveCustomer,
  onIdChange,
  hideSaveButton,
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
            formButtons
            size="sm"
            showCareof
            hideSaveButton={hideSaveButton}
            defaultValues={customerDefaults}
            onValuesChange={(v) => onChange(v)}
            onIdChange={onIdChange}
            onSubmit={onSaveCustomer}
          />

          {/* Overrides */}
          <div className="grid grid-cols-6 grid-rows-[auto_1fr] gap-4">
            <OverrideDate
              className="col-span-2"
              value={value.date}
              fallback={defaults.delivery.date}
              onChange={(d) => onChange({ date: d })}
            />
            <OverrideTime
              className="col-span-2"
              value={value.time}
              fallback={defaults.delivery.time}
              onChange={(t) => onChange({ time: t })}
              disabled={!defaults.showTime}
            />
            <OverrideToggles
              className="col-span-2"
              leaveDoor={value.leaveDoor}
              leaveNeighbour={value.leaveNeighbour}
              fallbackLeaveDoor={defaults.delivery.leaveDoor}
              fallbackLeaveNeighbour={defaults.delivery.leaveNeighbour}
              onLeaveDoorChange={(v) => onChange({ leaveDoor: v })}
              onLeaveNeighbourChange={(v) => onChange({ leaveNeighbour: v })}
            />
            <OverrideText
              className="col-span-3"
              label="Korttekst"
              placeholder="Kortteksten er tom."
              value={value.cardmsg}
              fallback={defaults.cardEnabled ? defaults.cardValue : ''}
              onChange={(v) => onChange({ cardmsg: v })}
              disabled={!defaults.cardEnabled && !value.cardmsg}
            />
            <OverrideText
              className="col-span-3"
              label="Instrukser"
              placeholder="Ingen instrukser for denne mottakeren."
              value={value.instructmsg}
              fallback={
                defaults.instructionsEnabled ? defaults.instructionsValue : ''
              }
              onChange={(v) => onChange({ instructmsg: v })}
              disabled={!defaults.instructionsEnabled && !value.instructmsg}
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
  className,
}: {
  value: string
  fallback: string
  onChange: (v: string) => void
  className?: string
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
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
              <span className="ml-auto text-xs font-mono uppercase text-primary">
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
  className,
}: {
  value: string | null
  fallback: string | null
  onChange: (v: string | null) => void
  disabled?: boolean
  hint?: string
  className?: string
}) {
  const isOverride = value !== fallback

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3',
        isOverride && !disabled && 'border-primary/50 bg-accent/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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

function OverrideToggles({
  leaveDoor,
  leaveNeighbour,
  fallbackLeaveDoor,
  fallbackLeaveNeighbour,
  onLeaveDoorChange,
  onLeaveNeighbourChange,
  className,
}: {
  leaveDoor: boolean
  leaveNeighbour: boolean
  fallbackLeaveDoor: boolean
  fallbackLeaveNeighbour: boolean
  onLeaveDoorChange: (v: boolean) => void
  onLeaveNeighbourChange: (v: boolean) => void
  className?: string
}) {
  const isOverride =
    leaveDoor !== fallbackLeaveDoor || leaveNeighbour !== fallbackLeaveNeighbour

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3',
        isOverride && 'border-primary/50 bg-accent/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Leveringsvalg
        </div>
        {isOverride ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onLeaveDoorChange(fallbackLeaveDoor)
              onLeaveNeighbourChange(fallbackLeaveNeighbour)
            }}
          >
            Nullstill
          </Button>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={leaveDoor}
          onCheckedChange={(v) => onLeaveDoorChange(v === true)}
        />
        Sett igjen ved dør
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={leaveNeighbour}
          onCheckedChange={(v) => onLeaveNeighbourChange(v === true)}
        />
        Levere til nabo
      </label>
    </div>
  )
}

function OverrideText({
  label,
  placeholder,
  value,
  fallback,
  onChange,
  disabled = false,
  className,
}: {
  label: string
  placeholder: string
  value: string
  fallback: string
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) {
  const isOverride = value !== fallback
  return (
    <div
      className={cn(
        'flex flex-col gap-2 min-h-full rounded-lg border p-3',
        isOverride && 'border-primary/50 bg-accent/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
        className="flex-1 resize-none gray:bg-background gray:border-border"
      />
    </div>
  )
}
