import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { TextBoxSwap } from '@/components/ui/TextBoxSwap'

interface OrderExtraInfoProps extends React.PropsWithChildren {
  className: string

  showCardText: boolean
  setShowCardText: (value: boolean) => void
  cardTextValue: string | null
  onCardTextValueChange: (value: string) => void
  onCardTextSubmit?: (value: string) => void

  showInstructionsText: boolean
  setShowInstructionsText: (value: boolean) => void
  instructionsTextValue: string | null
  onInstructionsTextValueChange: (value: string) => void
  onInstructionsSubmit?: (value: string) => void
}

export default function OrderExtraInfo({
  className,
  showCardText,
  setShowCardText,
  cardTextValue,
  onCardTextValueChange,
  showInstructionsText,
  setShowInstructionsText,
  instructionsTextValue,
  onInstructionsTextValueChange,
  onCardTextSubmit,
  onInstructionsSubmit,
}: OrderExtraInfoProps) {
  return (
    <div className={`${className} grid grid-cols-2 gap-4`}>
      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-card">Kort</FieldLabel>

            <TextBoxSwap
              id="textarea-card"
              showBool={showCardText}
              placeholder="Skriv korttekst her..."
              textValue={cardTextValue}
              onValueChange={onCardTextValueChange}
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
              onValueChange={onInstructionsTextValueChange}
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
