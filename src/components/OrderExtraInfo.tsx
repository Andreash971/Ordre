import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { TextBoxSwap } from '@/components/ui/TextBoxSwap'
import { useOrderForm } from '#/components/order-form/OrderFormContext'

interface OrderExtraInfoProps extends React.PropsWithChildren {
  className: string
  onCardTextSubmit?: (value: string) => void
  onInstructionsSubmit?: (value: string) => void
}

export default function OrderExtraInfo({
  className,
  onCardTextSubmit,
  onInstructionsSubmit,
}: OrderExtraInfoProps) {
  const {
    showCardText,
    setShowCardText,
    cardTextValue,
    setCardTextValue,
    showInstructionsText,
    setShowInstructionsText,
    instructionsTextValue,
    setInstructionsTextValue,
  } = useOrderForm()

  return (
    <div className={`${className} grid lg:grid-cols-2 gap-4`}>
      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-card">Kort</FieldLabel>

            <TextBoxSwap
              id="textarea-card"
              showBool={showCardText}
              placeholder="Skriv korttekst her..."
              textValue={cardTextValue}
              onValueChange={setCardTextValue}
              onSubmit={onCardTextSubmit}
              extraName="kort"
              toggleBool={() => setShowCardText(!showCardText)}
              tooltipWrite="Overskriv kundens personlige korttekst"
              tooltipRemove="Fjern kort og nullstill korttekster"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-instructions">
              Spesielle Instrukser
            </FieldLabel>

            <TextBoxSwap
              id="textarea-instructions"
              showBool={showInstructionsText}
              placeholder="Skriv instrukser her..."
              textValue={instructionsTextValue}
              onValueChange={setInstructionsTextValue}
              onSubmit={onInstructionsSubmit}
              extraName="instrukser"
              toggleBool={() => setShowInstructionsText(!showInstructionsText)}
              tooltipWrite="Overskriv kundens personlige instrukser"
              tooltipRemove="Fjern instrukser og nullstill"
            />
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}
