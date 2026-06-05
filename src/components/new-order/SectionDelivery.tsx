import { nb } from 'date-fns/locale'
import { ClockPlus, X, CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import { formatDeliveryDate, getLocalDateString } from '#/lib/order-utils'
import { getStoredSettings } from '#/lib/settings'
import DeliverySummary from '#/components/new-order/DeliverySummary'

interface SectionDeliveryProps {
  date: string
  time: string | null
  showTime: boolean
  onDateChange: (date: string) => void
  onTimeChange: (time: string | null) => void
  onShowTimeChange: (show: boolean) => void
}

function toIso(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

export default function SectionDelivery({
  date,
  time,
  showTime,
  onDateChange,
  onTimeChange,
  onShowTimeChange,
}: SectionDeliveryProps) {
  const TIME_PRESETS = getStoredSettings().deliveryTimePresets
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const quickPicks = [
    { label: 'I dag', value: toIso(today) },
    { label: 'I morgen', value: toIso(addDays(today, 1)) },
    { label: 'Fredag', value: toIso(nextWeekday(today, 5)) },
    { label: 'Lørdag', value: toIso(nextWeekday(today, 6)) },
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
            <Button
              key={q.label}
              type="button"
              variant={date === q.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDateChange(q.value)}
            >
              {q.label}
            </Button>
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
                if (d) onDateChange(toIso(d))
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
                <Button
                  key={t}
                  type="button"
                  variant={time === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTimeChange(t)}
                  className="font-mono"
                >
                  {t}
                </Button>
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
            onClick={() => onDateChange(getLocalDateString())}
            className="self-start"
          >
            <ClockPlus />
            Bruk dagens dato
          </Button>
        ) : null}
      </div>

      {/* Column 3: Summary — on md spans both columns below, on lg sits next to time */}
      <DeliverySummary
        date={date}
        time={time}
        className="md:col-span-2 lg:col-span-1 gray:bg-background"
      />
    </div>
  )
}
