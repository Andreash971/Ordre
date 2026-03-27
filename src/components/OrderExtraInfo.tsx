import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface OrderExtraInfoProps extends React.PropsWithChildren {
  className: string
}

export default function OrderExtraInfo({ className }: OrderExtraInfoProps) {
  const [ShowCardText, setShowCardText] = useState(false)
  const [ShowInstructionsText, setShowInstructionsText] = useState(false)

  return (
    <div className={`${className} grid grid-cols-2 gap-4`}>
      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-message">Kort</FieldLabel>
            <FieldGroup className="flex flex-row gap-2">
              <Checkbox
                id="show-cardtext"
                checked={ShowCardText}
                onCheckedChange={(checked) => setShowCardText(checked === true)}
              />
              <Label htmlFor="show-cardtext" className="cursor-pointer">
                Inkluder kort?
              </Label>
            </FieldGroup>
            {ShowCardText && (
              <Textarea
                id="textarea-message"
                placeholder="Skriv korttekst her..."
                className="h-36"
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="textarea-message">
              Spesielle Instrukser
            </FieldLabel>
            <FieldGroup className="flex flex-row gap-2">
              <Checkbox
                id="show-instructionstext"
                checked={ShowInstructionsText}
                onCheckedChange={(checked) =>
                  setShowInstructionsText(checked === true)
                }
              />
              <Label htmlFor="show-instructionstext" className="cursor-pointer">
                Inkluder spesielle instrukser?
              </Label>
            </FieldGroup>
            {ShowInstructionsText && (
              <Textarea
                id="textarea-message"
                placeholder="Skriv spesielle instrukser her..."
                className="h-36"
              />
            )}
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}
