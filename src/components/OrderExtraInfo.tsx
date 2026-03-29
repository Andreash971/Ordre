import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface OrderExtraInfoProps extends React.PropsWithChildren {
  className: string
  showCardText: boolean
  onCardTextChange: (value: boolean) => void
  cardTextValue: string
  onCardTextValueChange: (value: string) => void
  showInstructionsText: boolean
  onInstructionsChange: (value: boolean) => void
  instructionsTextValue: string
  onInstructionsTextValueChange: (value: string) => void
}

export default function OrderExtraInfo({
  className,
  showCardText,
  onCardTextChange,
  cardTextValue,
  onCardTextValueChange,
  showInstructionsText,
  onInstructionsChange,
  instructionsTextValue,
  onInstructionsTextValueChange,
}: OrderExtraInfoProps) {
  return (
    <div className={`${className} grid grid-cols-2 gap-4`}>
      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-card">Kort</FieldLabel>
            <FieldGroup className="flex flex-row gap-2">
              <Checkbox
                id="show-cardtext"
                checked={showCardText}
                onCheckedChange={(checked) =>
                  onCardTextChange(checked === true)
                }
              />
              <Label htmlFor="show-cardtext" className="cursor-pointer">
                Inkluder kort?
              </Label>
            </FieldGroup>
            {showCardText && (
              <Textarea
                id="textarea-card"
                placeholder="Skriv korttekst her..."
                className="h-36"
                value={cardTextValue}
                onChange={(e) => onCardTextValueChange(e.target.value)}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-instructions">
              Spesielle Instrukser
            </FieldLabel>
            <FieldGroup className="flex flex-row gap-2">
              <Checkbox
                id="show-instructionstext"
                checked={showInstructionsText}
                onCheckedChange={(checked) =>
                  onInstructionsChange(checked === true)
                }
              />
              <Label htmlFor="show-instructionstext" className="cursor-pointer">
                Inkluder spesielle instrukser?
              </Label>
            </FieldGroup>
            {showInstructionsText && (
              <Textarea
                id="textarea-instructions"
                placeholder="Skriv spesielle instrukser her..."
                className="h-36"
                value={instructionsTextValue}
                onChange={(e) => onInstructionsTextValueChange(e.target.value)}
              />
            )}
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}
