import { nb } from 'date-fns/locale'
import { ClockPlus, X, CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDeliveryDate } from '@/lib/order-utils'
import { toIsoDate } from '@/lib/format'
import { useSettings } from '@/lib/store-hooks'

interface DeliveryDefaultsProps {
  date: string
  time: string | null
  showTime: boolean
  leaveDoor: boolean
  leaveNeighbour: boolean
  onDateChange: (date: string) => void
  onTimeChange: (time: string | null) => void
  onShowTimeChange: (show: boolean) => void
  onLeaveDoorChange: (value: boolean) => void
  onLeaveNeighbourChange: (value: boolean) => void
}

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function nextWeekday(base: Date, weekday: number) {
  const d = new Date(base)
  const diff = (weekday + 7 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}

export default function DeliveryDefaults({
  date,
  time,
  showTime,
  leaveDoor,
  leaveNeighbour,
  onDateChange,
  onTimeChange,
  onShowTimeChange,
  onLeaveDoorChange,
  onLeaveNeighbourChange,
}: DeliveryDefaultsProps) {
  const TIME_PRESETS = useSettings().deliveryTimePresets
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const quickPicks = [
    { label: 'I dag', value: toIsoDate(today) },
    { label: 'I morgen', value: toIsoDate(addDays(today, 1)) },
    { label: 'Fredag', value: toIsoDate(nextWeekday(today, 5)) },
    { label: 'Lørdag', value: toIsoDate(nextWeekday(today, 6)) },
  ]

  const selectedDate = date ? new Date(date + 'T00:00:00') : undefined

  return (
    <div className="flex flex-col gap-4">
      {/* Date picker */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Leveringsdato
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPicks.map((q) => (
            <Chip
              key={q.label}
              selected={date === q.value}
              onClick={() => onDateChange(q.value)}
            >
              {q.label}
            </Chip>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 font-normal"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {selectedDate ? formatDeliveryDate(date).fullDate : 'Velg dato'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={nb}
              weekStartsOn={1}
              selected={selectedDate}
              onSelect={(d) => {
                if (d) onDateChange(toIsoDate(d))
              }}
              disabled={(d) => {
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                return d < todayStart
              }}
              showWeekNumber
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time picker */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Leveringstid
        </div>

        {!showTime ? (
          <Button
            type="button"
            onClick={() => {
              onShowTimeChange(true)
            }}
          >
            <ClockPlus />
            Legg til leveringstidspunkt
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {TIME_PRESETS.map((t) => (
                <Chip
                  key={t}
                  selected={time === t}
                  onClick={() => onTimeChange(t)}
                  className="font-mono"
                >
                  {t}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2">
              <TimePicker
                value={time}
                onChange={onTimeChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  onShowTimeChange(false)
                  onTimeChange(null)
                }}
                aria-label="Fjern leveringstid"
              >
                <X />
              </Button>
            </div>
          </div>
        )}

        {!showTime && !date ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(toIsoDate())}
            className="self-start"
          >
            <ClockPlus />
            Bruk dagens dato
          </Button>
        ) : null}
      </div>

      {/* Delivery options */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Leveringsvalg
        </div>
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
    </div>
  )
}
