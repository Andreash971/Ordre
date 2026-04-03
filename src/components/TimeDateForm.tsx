import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'

import { CalendarIcon } from 'lucide-react'

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
            <FieldLabel>Leveringstidspunkt</FieldLabel>
            <FieldGroup className="flex flex-row gap-2">
              <Checkbox
                id="show-time"
                checked={showTime}
                onCheckedChange={(checked) => {
                  const val = checked === true
                  setShowTime(val)
                  onShowTimeChange?.(val)
                  if (!val) {
                    setTime(null)
                    onValuesChange?.({ date, time: null })
                  }
                }}
              />
              <Label htmlFor="show-time" className="cursor-pointer">
                Inkluder leveringstidspunkt?
              </Label>
            </FieldGroup>
            {showTime && (
              <TimePicker
                value={time}
                onChange={(val) => {
                  setTime(val)
                  onValuesChange?.({ date, time: val })
                }}
                className="w-full"
              />
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
