import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
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
}

const formSchema = z.object({
  date: z.string().min(1),
  time: z.string().nullable(),
})

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
}: TimeDateFormProps) {
  const today = getLocalDateString()
  const [showTime, setShowTime] = useState(false)

  const form = useForm({
    defaultValues: {
      date: today,
      time: null as string | null,
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Leveringsinformasjon</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup className="flex flex-col gap-4">
            {/* DATE FIELD */}
            <form.Field
              name="date"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const selectedDate = field.state.value
                  ? new Date(field.state.value + 'T00:00:00')
                  : undefined
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Leveringsdato</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 font-normal"
                          aria-invalid={isInvalid}
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
                          onSelect={(date) => {
                            if (date) {
                              const y = date.getFullYear()
                              const m = String(date.getMonth() + 1).padStart(
                                2,
                                '0',
                              )
                              const d = String(date.getDate()).padStart(2, '0')
                              field.handleChange(`${y}-${m}-${d}`)
                            }
                          }}
                          disabled={(date) => {
                            const todayStart = new Date()
                            todayStart.setHours(0, 0, 0, 0)
                            return date < todayStart
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            {/* TIME FIELD */}
            <form.Field
              name="time"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Leveringstidspunkt</FieldLabel>
                    <FieldGroup className="flex flex-row gap-2">
                      <Checkbox
                        id="show-time"
                        checked={showTime}
                        onCheckedChange={(checked) => {
                          const val = checked === true
                          setShowTime(val)
                          onShowTimeChange?.(val)
                        }}
                      />
                      <Label htmlFor="show-time" className="cursor-pointer">
                        Inkluder leveringstidspunkt?
                      </Label>
                    </FieldGroup>
                    {showTime && (
                      <TimePicker
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val)}
                        className="w-full"
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
