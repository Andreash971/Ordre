import { useForm } from '@tanstack/react-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

import { User } from 'lucide-react'
import { Phone } from 'lucide-react'
import { BriefcaseBusiness } from 'lucide-react'
import { House } from 'lucide-react'
import { MapPin } from 'lucide-react'
import { Building2 } from 'lucide-react'

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
      onBlur: formSchema,
      onChange: formSchema,
    },
    onSubmit: (values) => {
      console.log(values)
    },
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Kundeinformasjon</CardTitle>
      </CardHeader>
      <CardContent className="">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup className="flex flex-col gap-4">
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <InputGroup>
                      <InputGroupAddon>
                        <User className="text-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="{field.name}"
                        name="{field.name}"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Navn"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <Field>
              <InputGroup>
                <InputGroupAddon>
                  <Phone className="text-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  name="phone"
                  placeholder="Telefon"
                />
              </InputGroup>
              <FieldError />
            </Field>
            <Field>
              <InputGroup>
                <InputGroupAddon>
                  <BriefcaseBusiness className="text-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  name="company"
                  placeholder="Firma"
                />
              </InputGroup>
              <FieldError />
            </Field>
            <Field>
              <InputGroup>
                <InputGroupAddon>
                  <House className="text-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  name="address"
                  placeholder="Adresse"
                />
              </InputGroup>
              <FieldError />
            </Field>
            <Field>
              <InputGroup>
                <InputGroupAddon>
                  <MapPin className="text-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  name="zip"
                  placeholder="Postnummer"
                />
              </InputGroup>
              <FieldError />
            </Field>
            <Field>
              <InputGroup>
                <InputGroupAddon>
                  <Building2 className="text-foreground" />
                </InputGroupAddon>
                <InputGroupInput type="text" name="city" placeholder="Sted" />
              </InputGroup>
              <FieldError />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button type="reset" variant="destructive">
          Reset
        </Button>
        <Button type="submit">Lagre</Button>
      </CardFooter>
    </Card>
  )
}
