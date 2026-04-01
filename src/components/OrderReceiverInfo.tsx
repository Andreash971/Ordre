import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Field, FieldLabel } from '@/components/ui/field'
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
import { User } from 'lucide-react'

import CustomerForm from '../components/CustomerForm'

import { Plus } from 'lucide-react'
import { Minus } from 'lucide-react'

interface OrderReceiverInfoProps extends React.PropsWithChildren {
  className: string
  showInstructionsText: boolean
  showCardText: boolean
  defaultCardText?: string
  defaultInstructionsText?: string
}

type Customer = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  cardmsg: string
  instructmsg: string
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
})

export default function OrderReceiverInfo({
  className,
  showInstructionsText,
  showCardText,
  defaultCardText = '',
  defaultInstructionsText = '',
}: OrderReceiverInfoProps) {
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const handleAdd = () => {
    setCustomers((prev) => {
      const next = [
        ...prev,
        {
          ...emptyCustomer(),
          cardmsg: defaultCardText,
          instructmsg: defaultInstructionsText,
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

  const selected = selectedIndex !== null ? customers[selectedIndex] : null

  return (
    <Card className={className}>
      <CardContent>
        <div className="grid grid-cols-[16rem_35%_1fr] gap-4">
          <div className="col-start-1 relative">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base leading-normal font-medium">
                  Mottakere
                </h4>
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
              <ScrollArea className="flex-1 min-h-0 rounded-md border">
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
            className="col-start-2"
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
          <div className="col-start-3 grid grid-rows-2 gap-4">
            <Field>
              <FieldLabel htmlFor="receiver-card">Kort</FieldLabel>
              <Textarea
                id="receiver-card"
                placeholder="Skriv korttekst her..."
                className="h-36 field-sizing-fixed"
                disabled={!showCardText || selectedIndex === null}
                value={selected?.cardmsg ?? ''}
                onChange={(e) =>
                  selectedIndex !== null &&
                  updateCustomerField(selectedIndex, 'cardmsg', e.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="receiver-instructions">
                Spesielle Instrukser
              </FieldLabel>
              <Textarea
                id="receiver-instructions"
                placeholder="Skriv spesielle instrukser her..."
                className="h-36 field-sizing-fixed"
                disabled={!showInstructionsText || selectedIndex === null}
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
            </Field>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
