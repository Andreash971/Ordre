import * as React from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TimePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
  disabled?: boolean
  allowNull?: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '30']
const DEFAULT_HOUR = '16'

export function TimePicker({
  value,
  onChange,
  className,
  disabled,
  allowNull,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedHour = value?.split(':')[0] ?? null
  const selectedMinute = value?.split(':')[1] ?? null

  const defaultHourRef = React.useRef<HTMLButtonElement>(null)
  const selectedHourRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        const target = selectedHourRef.current ?? defaultHourRef.current
        target?.scrollIntoView({ block: 'nearest' })
      }, 0)
    }
  }, [open])

  function handleSelect(hour: string, minute: string) {
    onChange(`${hour}:${minute}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={(val) => !disabled && setOpen(val)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('justify-start gap-2 font-normal', className)}
        >
          <Clock className="size-4 text-muted-foreground" />
          {value ?? 'Velg tidspunkt'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-0" align="start">
        {allowNull && value !== null && (
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="w-full px-3 py-1.5 text-center text-sm text-muted-foreground hover:bg-muted border-b"
          >
            Fjern tidspunkt
          </button>
        )}
        <div className="flex divide-x">
          {/* HOURS */}
          <div
            role="listbox"
            aria-label="Timer"
            className="flex-1 max-h-60 overflow-y-auto py-1"
          >
            {HOURS.map((hour) => (
              <button
                key={hour}
                role="option"
                aria-selected={hour === selectedHour}
                ref={
                  hour === selectedHour
                    ? selectedHourRef
                    : hour === DEFAULT_HOUR
                      ? defaultHourRef
                      : undefined
                }
                onClick={() => handleSelect(hour, selectedMinute ?? '00')}
                className={cn(
                  'w-full px-3 py-1.5 text-center text-sm',
                  hour === selectedHour
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                {hour}
              </button>
            ))}
          </div>

          {/* MINUTES */}
          <div role="listbox" aria-label="Minutter" className="flex-1 py-1">
            {MINUTES.map((minute) => (
              <button
                key={minute}
                role="option"
                aria-selected={minute === selectedMinute}
                onClick={() =>
                  handleSelect(selectedHour ?? DEFAULT_HOUR, minute)
                }
                className={cn(
                  'w-full px-3 py-1.5 text-center text-sm',
                  minute === selectedMinute
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                {minute}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
