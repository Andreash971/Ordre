import { useForm } from '@tanstack/react-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { User } from 'lucide-react'

interface CustomerFormProps extends React.PropsWithChildren {
  className: string
}

const formSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  zip: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
})

export default function CustomerForm({ className }: CustomerFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      company: '',
      address: '',
      zip: '',
      city: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: (values) => {
      console.log(values)
    },
  })

  return (
    <Card className={className}>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <Field>
            <CardHeader>
              <CardTitle>Kundeinformasjon</CardTitle>
            </CardHeader>
            <FieldLabel>Navn</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <User className="text-foreground" />
              </InputGroupAddon>
              <Input type="text" name="name" placeholder="Navn" />
            </InputGroup>
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Telefon</FieldLabel>
            <InputGroup>
              <InputGroupAddon type="prefix">
                <InputGroupText>📞</InputGroupText>
              </InputGroupAddon>
              <Input type="text" name="phone" placeholder="Telefonnummer" />
            </InputGroup>
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Firma</FieldLabel>
            <InputGroup>
              <InputGroupAddon type="prefix">
                <InputGroupText>🏢</InputGroupText>
              </InputGroupAddon>
              <Input type="text" name="company" placeholder="Firma navn" />
            </InputGroup>
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Adresse</FieldLabel>
            <InputGroup>
              <InputGroupAddon type="prefix">
                <InputGroupText>📍</InputGroupText>
              </InputGroupAddon>
              <Input type="text" name="address" placeholder="Adresse" />
            </InputGroup>
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Postnummer</FieldLabel>
            <InputGroup>
              <InputGroupAddon type="prefix">
                <InputGroupText>📬</InputGroupText>
              </InputGroupAddon>
              <Input type="text" name="zip" placeholder="Postnummer" />
            </InputGroup>
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Sted</FieldLabel>
            <InputGroup>
              <InputGroupAddon type="prefix">
                <InputGroupText>🏙️</InputGroupText>
              </InputGroupAddon>
              <Input type="text" name="city" placeholder="Sted" />
            </InputGroup>
            <FieldError />
          </Field>
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}
