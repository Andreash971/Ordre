import * as React from 'react'
import { nb } from 'date-fns/locale'
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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

import CustomerForm from '@/components/CustomerForm'
import { formatDeliveryDate, pickCustomerFormValues } from '@/lib/order-utils'
import { toIsoDate } from '@/lib/format'
import { useSaveCustomerMutation } from '@/hooks/use-save-customer-mutation'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '@/lib/order-utils'

interface RecipientListProps {
  recipients: Customer[]
  onRecipientsChange: React.Dispatch<React.SetStateAction<Customer[]>>
  onRecipientIdsChange: React.Dispatch<React.SetStateAction<(number | null)[]>>
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

/** Number of fields a recipient overrides vs. the shared (master) defaults. */
function countOverrides(
  r: Customer,
  defaults: RecipientListProps['defaults'],
): number {
  return [
    Boolean(r.date && r.date !== defaults.delivery.date),
    r.time !== defaults.delivery.time && defaults.showTime,
    r.leaveDoor !== defaults.delivery.leaveDoor,
    r.leaveNeighbour !== defaults.delivery.leaveNeighbour,
    defaults.cardEnabled &&
      Boolean(r.cardmsg) &&
      r.cardmsg !== defaults.cardValue,
    defaults.instructionsEnabled &&
      Boolean(r.instructmsg) &&
      r.instructmsg !== defaults.instructionsValue,
  ].filter(Boolean).length
}

export default function RecipientList({
  recipients,
  onRecipientsChange,
  onRecipientIdsChange,
  autoSaveCustomer,
  defaults,
}: RecipientListProps) {
  const [expanded, setExpanded] = React.useState<number | null>(0)
  const saveCustomerMutation = useSaveCustomerMutation()
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
            <EmptyTitle>Ingen definerte mottakere</EmptyTitle>
            <EmptyDescription>
              Avsender vil automatisk settes som mottaker.
            </EmptyDescription>
            <EmptyContent>
              <Button type="button" variant="default" onClick={addRecipient}>
                <UserPlus />
                Legg til mottaker
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            Hver mottaker arver de{' '}
            <b className="font-medium text-foreground">felles</b> verdiene over.
            Du trenger bare å fylle ut mottakerens informasjon, og endre det som
            skal være <b className="font-medium text-foreground">annerledes</b>.
          </span>
        </div>
      )}

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
  defaults: RecipientListProps['defaults']
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
  const overrides = countOverrides(value, defaults)

  const customerDefaults: Partial<CustomerFormValues> =
    pickCustomerFormValues(value)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        overrides > 0 && 'border-primary ring-1 ring-primary/10',
      )}
    >
      <button
        type="button"
        onClick={onExpand}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">
            {value.name || `Mottaker ${index + 1}`}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {value.address || 'Ingen adresse'}
          </div>
        </div>
        <div className="hidden flex-col items-end text-right sm:flex">
          <div className="text-xs">
            Leveres {formattedDate?.shortDate ?? '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            {value.time ? `kl. ${value.time}` : 'Ingen leveringstid'}
          </div>
        </div>
        {overrides === 0 ? (
          <Badge
            variant="secondary"
            className="shrink-0 font-mono text-[10px] uppercase tracking-wider"
          >
            Alt felles
          </Badge>
        ) : (
          <Badge
            variant="soft"
            className="shrink-0 gap-1 font-mono text-[10px] uppercase tracking-wider"
          >
            <span className="size-1.5 rounded-full bg-current" />
            {overrides} endret felt
          </Badge>
        )}
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded ? (
        <div className="grid grid-cols-[15rem_1fr] grid-rows-[auto_auto] gap-4 border-t px-4 pb-4 pt-4">
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

/** A small "Endret" tag on an overridden field label. */
function EndretTag() {
  return (
    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-primary">
      Endret
    </span>
  )
}

/** A muted "· felles" hint appended to a field label when it is inherited. */
function FellesHint() {
  return (
    <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
      · felles
    </span>
  )
}

function OvrHead({
  label,
  isOverride,
  disabled = false,
  resetLabel,
  onReset,
}: {
  label: string
  isOverride: boolean
  disabled?: boolean
  resetLabel: string
  onReset: () => void
}) {
  return (
    <div className="flex min-h-6 items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
        {isOverride ? <EndretTag /> : !disabled ? <FellesHint /> : null}
      </span>
      {isOverride && !disabled ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={onReset}
        >
          {resetLabel}
        </Button>
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
    <div className={cn('flex flex-col gap-2', className)}>
      <OvrHead
        label="Leveringsdato"
        isOverride={isOverride}
        resetLabel="Nullstill"
        onReset={() => onChange('')}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'justify-start gap-2 font-normal',
              isOverride && 'border-primary',
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {formatted ? formatted.fullDate : 'Velg dato'}
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
                onChange(toIsoDate(d))
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
    <div className={cn('flex flex-col gap-2', className)}>
      <OvrHead
        label="Leveringstid"
        isOverride={isOverride}
        disabled={disabled}
        resetLabel="Nullstill"
        onReset={() => onChange(fallback)}
      />
      <TimePicker
        value={value}
        onChange={onChange}
        allowNull
        disabled={disabled}
        className={cn(isOverride && !disabled && 'border-primary')}
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
    <div className={cn('flex flex-col gap-2', className)}>
      <OvrHead
        label="Leveringsvalg"
        isOverride={isOverride}
        resetLabel="Nullstill"
        onReset={() => {
          onLeaveDoorChange(fallbackLeaveDoor)
          onLeaveNeighbourChange(fallbackLeaveNeighbour)
        }}
      />
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={leaveDoor}
          onCheckedChange={(v) => onLeaveDoorChange(v === true)}
        />
        Kan settes igjen ved dør
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={leaveNeighbour}
          onCheckedChange={(v) => onLeaveNeighbourChange(v === true)}
        />
        Kan leveres til nabo
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
    <div className={cn('flex min-h-full flex-col gap-2', className)}>
      <OvrHead
        label={label}
        isOverride={isOverride}
        disabled={disabled}
        resetLabel="Bruk felles"
        onReset={() => onChange(fallback)}
      />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('flex-1 resize-none', isOverride && 'border-primary')}
      />
    </div>
  )
}
