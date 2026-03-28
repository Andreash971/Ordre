import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from './ui/button-group'

import CustomerForm from '../components/CustomerForm'

import { Plus } from 'lucide-react'
import { Minus } from 'lucide-react'

interface OrderReceiverInfoProps extends React.PropsWithChildren {
  className: string
  showInstructionsText: boolean
  showCardText: boolean
}

const tags = Array.from({ length: 3 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`,
)

export default function OrderReceiverInfo({
  className,
  showInstructionsText,
  showCardText,
}: OrderReceiverInfoProps) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="grid grid-cols-[16rem_35%_1fr] grid-rows-[auto_auto] gap-4">
          <div className="col-start-1 relative">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base leading-normal font-medium">
                  Mottakere
                </h4>
                <ButtonGroup>
                  <Button>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </ButtonGroup>
              </div>
              <ScrollArea className="flex-1 min-h-0 rounded-md border">
                <div className="p-4">
                  {tags.map((tag) => (
                    <React.Fragment key={tag}>
                      <div className="text-sm">{tag}</div>
                      <Separator className="my-2" />
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <CustomerForm className="col-start-2" />
          <div className="col-start-3 grid grid-rows-2 gap-4">
            <Field>
              <FieldLabel htmlFor="receiver-card">Kort</FieldLabel>
              <Textarea
                id="receiver-card"
                placeholder="Skriv korttekst her..."
                className="h-36 field-sizing-fixed"
                disabled={!showCardText}
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
                disabled={!showInstructionsText}
              />
            </Field>
          </div>
          <div className="col-span-3 flex flex-row justify-end gap-2">
            <Button type="reset" variant="destructive">
              Reset
            </Button>
            <Button type="submit">Lagre</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
