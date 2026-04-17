import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import type { DeliveryValues } from '#/lib/order-utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
} from './ui/item'
import CustomerForm from '../components/CustomerForm'
import { EmptyCard } from '@/components/ui/empty-card'
import { useOrderForm } from '#/components/order-form/OrderFormContext'

import { CalendarIcon, User, Plus, Minus } from 'lucide-react'

type Customer = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  cardmsg: string
  instructmsg: string
  date: string
  time: string | null
}

interface OrderReceiverInfoProps extends React.PropsWithChildren {
  className: string
  defaultDeliveryValues?: DeliveryValues
  onCustomersChange?: (customers: Customer[]) => void
}

export type OrderReceiverInfoHandle = {
  updateSelectedCustomerField: (
    field: 'cardmsg' | 'instructmsg',
    value: string,
  ) => void
}

const emptyCustomer = (): Customer => ({
  name: '',
  phone: '',
  company: '',
  address: '',
  postcode: '',
  city: '',
  cardmsg: '',
  instructmsg: '',
  date: '',
  time: null,
})

const OrderReceiverInfo = React.forwardRef<
  OrderReceiverInfoHandle,
  OrderReceiverInfoProps
>(function OrderReceiverInfoInner(
  {
    className,
    defaultDeliveryValues,
    onCustomersChange,
  }: OrderReceiverInfoProps,
  ref,
) {
  const {
    showCardText,
    showInstructionsText,
    showTime,
    cardTextValue: defaultCardText,
    instructionsTextValue: defaultInstructionsText,
  } = useOrderForm()

  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    onCustomersChange?.(customers)
  }, [customers, onCustomersChange])

  React.useEffect(() => {
    if (!showCardText) {
      setCustomers((prev) => prev.map((c) => ({ ...c, cardmsg: '' })))
    }
  }, [showCardText])

  React.useEffect(() => {
    if (!showInstructionsText) {
      setCustomers((prev) => prev.map((c) => ({ ...c, instructmsg: '' })))
    }
  }, [showInstructionsText])

  const handleAdd = () => {
    setCustomers((prev) => {
      const next = [
        ...prev,
        {
          ...emptyCustomer(),
          cardmsg: defaultCardText,
          instructmsg: defaultInstructionsText,
          date: defaultDeliveryValues?.date ?? '',
          time: defaultDeliveryValues?.time ?? null,
        },
      ]
      setSelectedIndex(next.length - 1)
      return next
    })
  }

  const handleRemove = () => {
    if (selectedIndex === null) return
    setCustomers((prev) => {
      const next = prev.filter((_, i) => i !== selectedIndex)
      if (next.length === 0) {
        setSelectedIndex(null)
      } else {
        setSelectedIndex(Math.min(selectedIndex, next.length - 1))
      }
      return next
    })
  }

  const updateCustomerField = (
    index: number,
    field: 'cardmsg' | 'instructmsg',
    value: string,
  ) => {
    setCustomers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  React.useImperativeHandle(ref, () => ({
    updateSelectedCustomerField(field, value) {
      if (selectedIndex !== null) {
        updateCustomerField(selectedIndex, field, value)
      }
    },
  }))

  const updateCustomerDelivery = (
    index: number,
    field: 'date' | 'time',
    value: string | null,
  ) => {
    setCustomers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  const selected = selectedIndex !== null ? customers[selectedIndex] : null

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[12rem_minmax(15rem,1fr)_1fr] lg:grid-rows-[auto_auto]">
          <div className="lg:col-start-1 lg:row-span-2 lg:relative">
            <div className="lg:absolute lg:inset-0 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base leading-normal font-medium">
                  Mottakere
                </h2>
                <ButtonGroup>
                  <Button
                    onClick={handleRemove}
                    disabled={selectedIndex === null}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </ButtonGroup>
              </div>
              <ScrollArea className="flex-1 min-h-0 max-h-48 lg:max-h-none rounded-md border">
                <div className="p-4">
                  {customers.map((customer, i) => (
                    <React.Fragment key={i}>
                      <Item
                        variant="outline"
                        size="xs"
                        className={`${
                          selectedIndex === i
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted'
                        } mb-2`}
                        onClick={() => setSelectedIndex(i)}
                      >
                        <ItemMedia variant="icon">
                          <User />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            {customer.name || `Mottaker ${i + 1}`}
                          </ItemTitle>
                          <ItemDescription
                            className={`${
                              selectedIndex === i
                                ? 'text-accent-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {customer.phone}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <CustomerForm
            key={selectedIndex ?? 'empty'}
            className="lg:col-start-2"
            formButtons={true}
            size="sm"
            showCareof={true}
            disabled={selectedIndex === null}
            defaultValues={selected ?? undefined}
            onValuesChange={(values) => {
              if (selectedIndex !== null) {
                setCustomers((prev) =>
                  prev.map((c, i) =>
                    i === selectedIndex ? { ...c, ...values } : c,
                  ),
                )
              }
            }}
          />
          <div className="lg:col-start-3 grid lg:grid-rows-2 gap-4">
            <Field>
              <FieldLabel htmlFor="receiver-card">Kort</FieldLabel>

              {showCardText ? (
                <Textarea
                  id="receiver-card"
                  placeholder="Skriv korttekst her..."
                  className="h-40 field-sizing-fixed resize-none"
                  disabled={selectedIndex === null}
                  value={selected?.cardmsg ?? ''}
                  onChange={(e) =>
                    selectedIndex !== null &&
                    updateCustomerField(
                      selectedIndex,
                      'cardmsg',
                      e.target.value,
                    )
                  }
                />
              ) : (
                <EmptyCard
                  className="h-40 field-sizing-fixed"
                  componentName="kort"
                />
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="receiver-instructions">
                Spesielle Instrukser
              </FieldLabel>

              {showInstructionsText ? (
                <Textarea
                  id="receiver-instructions"
                  placeholder="Skriv spesielle instrukser her..."
                  className="h-40 field-sizing-fixed resize-none"
                  disabled={selectedIndex === null}
                  value={selected?.instructmsg ?? ''}
                  onChange={(e) =>
                    selectedIndex !== null &&
                    updateCustomerField(
                      selectedIndex,
                      'instructmsg',
                      e.target.value,
                    )
                  }
                />
              ) : (
                <EmptyCard
                  className="h-40 field-sizing-fixed"
                  componentName="instrukser"
                />
              )}
            </Field>
          </div>
          <div className="lg:col-start-2 lg:col-span-2 @container/delivery">
            <FieldGroup className="flex flex-col @[32rem]/delivery:flex-row gap-4">
              {/* DATE FIELD */}
              <Field>
                <FieldLabel>Leveringsdato</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 font-normal"
                      disabled={selectedIndex === null}
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {selected?.date
                        ? new Date(
                            selected.date + 'T00:00:00',
                          ).toLocaleDateString('nb-NO', { dateStyle: 'long' })
                        : 'Velg dato'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        selected?.date
                          ? new Date(selected.date + 'T00:00:00')
                          : undefined
                      }
                      onSelect={(d) => {
                        if (d && selectedIndex !== null) {
                          const y = d.getFullYear()
                          const m = String(d.getMonth() + 1).padStart(2, '0')
                          const day = String(d.getDate()).padStart(2, '0')
                          updateCustomerDelivery(
                            selectedIndex,
                            'date',
                            `${y}-${m}-${day}`,
                          )
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
                <TimePicker
                  value={selected?.time ?? null}
                  onChange={(val) => {
                    if (selectedIndex !== null) {
                      updateCustomerDelivery(selectedIndex, 'time', val)
                    }
                  }}
                  className="w-full"
                  disabled={!showTime || selectedIndex === null}
                  allowNull
                />
              </Field>
            </FieldGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default OrderReceiverInfo
