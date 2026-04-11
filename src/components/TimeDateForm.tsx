import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import { TooltipWrapper } from '@/components/ui/TooltipWrapper'

import { CalendarIcon, ClockPlus, X } from 'lucide-react'

interface TimeDateFormProps extends React.PropsWithChildren {
  className: string
  onShowTimeChange?: (show: boolean) => void
  onValuesChange?: (values: { date: string; time: string | null }) => void
}

function getLocalDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TimeDateForm({
  className,
  onShowTimeChange,
  onValuesChange,
}: TimeDateFormProps) {
  const [date, setDate] = useState(getLocalDateString())
  const [time, setTime] = useState<string | null>(null)
  const [showTime, setShowTime] = useState(false)

  const selectedDate = date ? new Date(date + 'T00:00:00') : undefined

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Leveringsinformasjon</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-4">
          {/* DATE FIELD */}
          <Field>
            <FieldLabel>Leveringsdato</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  {selectedDate
                    ? selectedDate.toLocaleDateString('nb-NO', {
                        dateStyle: 'long',
                      })
                    : 'Velg dato'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      const newDate = `${y}-${m}-${day}`
                      setDate(newDate)
                      onValuesChange?.({ date: newDate, time })
                    }
                  }}
                  disabled={(d) => {
                    const todayStart = new Date()
                    todayStart.setHours(0, 0, 0, 0)
                    return d < todayStart
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>

          {/* TIME FIELD */}
          <Field>
            <FieldLabel htmlFor="time-picker">Leveringstidspunkt</FieldLabel>
            {showTime ? (
              <div className="flex w-full">
                <TimePicker
                  id="time-picker"
                  value={time}
                  onChange={(val) => {
                    setTime(val)
                    onValuesChange?.({ date, time: val })
                  }}
                  className="flex-1"
                />
                <TooltipWrapper TooltipText="Fjern leveringstidspunkt">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowTime(false)
                      setTime(null)
                      onShowTimeChange?.(false)
                      onValuesChange?.({ date, time: null })
                    }}
                    className="ml-2"
                  >
                    <X />
                  </Button>
                </TooltipWrapper>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setShowTime(true)
                  onShowTimeChange?.(true)
                }}
              >
                <ClockPlus />
                Legg til leveringstidspunkt
              </Button>
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
