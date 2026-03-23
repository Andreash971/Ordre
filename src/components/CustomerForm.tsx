import { useForm } from '@tanstack/react-form'
import { ilike } from 'drizzle-orm'
import { useState } from 'react'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { User } from 'lucide-react'
import { Phone } from 'lucide-react'
import { BriefcaseBusiness } from 'lucide-react'
import { House } from 'lucide-react'
import { MapPin } from 'lucide-react'
import { Building2 } from 'lucide-react'

import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/'
import { customersDummy } from '#/db/schema'

interface CustomerFormProps extends React.PropsWithChildren {
  className: string
}

const formSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
})

const customerSelect = {
  id: customersDummy.id,
  name: customersDummy.name,
  phone: customersDummy.phone,
  business: customersDummy.business,
  address: customersDummy.address,
  postcode: customersDummy.postcode,
  city: customersDummy.city,
}

export const getCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.select({ name: customersDummy.name }).from(customersDummy)
  },
)

export const searchCustomers = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.name, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByPhone = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.phone, `%${query}%`))
      .limit(3)
  })

export const searchCustomersByBusiness = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select(customerSelect)
      .from(customersDummy)
      .where(ilike(customersDummy.business, `%${query}%`))
      .limit(3)
  })

type CustomerSuggestion = Awaited<ReturnType<typeof searchCustomers>>[number]

function fillForm(
  form: {
    setFieldValue: (
      field: 'name' | 'phone' | 'company' | 'address' | 'postcode' | 'city',
      value: string,
    ) => void
  },
  customer: CustomerSuggestion,
) {
  form.setFieldValue('name', customer.name)
  form.setFieldValue('phone', customer.phone ?? '')
  form.setFieldValue('company', customer.business ?? '')
  form.setFieldValue('address', customer.address ?? '')
  form.setFieldValue('postcode', customer.postcode ?? '')
  form.setFieldValue('city', customer.city ?? '')
}

export default function CustomerForm({ className }: CustomerFormProps) {
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [phoneSuggestions, setPhoneSuggestions] = useState<
    CustomerSuggestion[]
  >([])
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)
  const [companySuggestions, setCompanySuggestions] = useState<
    CustomerSuggestion[]
  >([])
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      company: '',
      address: '',
      postcode: '',
      city: '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        // autosave logic
        if (formApi.state.isValid) {
          formApi.handleSubmit()
        }
      },
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
            {/* FORM NAME INPUT */}
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="relative">
                      <InputGroup>
                        <InputGroupAddon>
                          <User className="text-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="{field.name}"
                          name="{field.name}"
                          type="text"
                          value={field.state.value}
                          onChange={async (e) => {
                            const value = e.target.value
                            field.handleChange(value)
                            if (value.length >= 1) {
                              const results = await searchCustomers({
                                data: value,
                              })
                              setSuggestions(results)
                              setShowSuggestions(true)
                            } else {
                              setSuggestions([])
                              setShowSuggestions(false)
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 150)
                          }}
                          aria-invalid={isInvalid}
                          placeholder="Navn"
                          autoComplete="off"
                        />
                      </InputGroup>
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
                          {suggestions.map((customer) => (
                            <li
                              key={customer.id}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={() => {
                                fillForm(form, customer)
                                setShowSuggestions(false)
                              }}
                            >
                              <span className="font-medium">
                                {customer.name}
                              </span>
                              {(customer.phone || customer.business) && (
                                <span className="text-xs text-muted-foreground flex gap-1.5 mt-0.5">
                                  {customer.phone && (
                                    <span>{customer.phone}</span>
                                  )}
                                  {customer.phone && customer.business && (
                                    <span>|</span>
                                  )}
                                  {customer.business && (
                                    <span>{customer.business}</span>
                                  )}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            {/* FORM PHONE INPUT */}
            <form.Field
              name="phone"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="relative">
                      <InputGroup>
                        <InputGroupAddon>
                          <Phone className="text-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="{field.name}"
                          name="{field.name}"
                          type="tel"
                          value={field.state.value}
                          onChange={async (e) => {
                            const value = e.target.value
                            field.handleChange(value)
                            if (value.length >= 1) {
                              const results = await searchCustomersByPhone({
                                data: value,
                              })
                              setPhoneSuggestions(results)
                              setShowPhoneSuggestions(true)
                            } else {
                              setPhoneSuggestions([])
                              setShowPhoneSuggestions(false)
                            }
                          }}
                          onBlur={() => {
                            setTimeout(
                              () => setShowPhoneSuggestions(false),
                              150,
                            )
                          }}
                          aria-invalid={isInvalid}
                          placeholder="Telefon"
                          autoComplete="off"
                        />
                      </InputGroup>
                      {showPhoneSuggestions && phoneSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
                          {phoneSuggestions.map((customer) => (
                            <li
                              key={customer.id}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={() => {
                                fillForm(form, customer)
                                setShowPhoneSuggestions(false)
                              }}
                            >
                              <span className="font-medium">
                                {customer.name}
                              </span>
                              {(customer.phone || customer.business) && (
                                <span className="text-xs text-muted-foreground flex gap-1.5 mt-0.5">
                                  {customer.phone && (
                                    <span>{customer.phone}</span>
                                  )}
                                  {customer.phone && customer.business && (
                                    <span>|</span>
                                  )}
                                  {customer.business && (
                                    <span>{customer.business}</span>
                                  )}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            {/* FORM COMPANY INPUT */}
            <form.Field
              name="company"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="relative">
                      <InputGroup>
                        <InputGroupAddon>
                          <BriefcaseBusiness className="text-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="{field.name}"
                          name="{field.name}"
                          type="text"
                          value={field.state.value}
                          onChange={async (e) => {
                            const value = e.target.value
                            field.handleChange(value)
                            if (value.length >= 1) {
                              const results = await searchCustomersByBusiness({
                                data: value,
                              })
                              setCompanySuggestions(results)
                              setShowCompanySuggestions(true)
                            } else {
                              setCompanySuggestions([])
                              setShowCompanySuggestions(false)
                            }
                          }}
                          onBlur={() => {
                            setTimeout(
                              () => setShowCompanySuggestions(false),
                              150,
                            )
                          }}
                          aria-invalid={isInvalid}
                          placeholder="Firma"
                          autoComplete="off"
                        />
                      </InputGroup>
                      {showCompanySuggestions &&
                        companySuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
                            {companySuggestions.map((customer) => (
                              <li
                                key={customer.id}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                onMouseDown={() => {
                                  fillForm(form, customer)
                                  setShowCompanySuggestions(false)
                                }}
                              >
                                <span className="font-medium">
                                  {customer.name}
                                </span>
                                {(customer.phone || customer.business) && (
                                  <span className="text-xs text-muted-foreground flex gap-1.5 mt-0.5">
                                    {customer.phone && (
                                      <span>{customer.phone}</span>
                                    )}
                                    {customer.phone && customer.business && (
                                      <span>|</span>
                                    )}
                                    {customer.business && (
                                      <span>{customer.business}</span>
                                    )}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            {/* FORM ADDRESS INPUT */}
            <form.Field
              name="address"
              children={(field) => {
                const isInvalid: boolean =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <InputGroup>
                      <InputGroupAddon>
                        <House className="text-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="{field.name}"
                        name="{field.name}"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Adresse"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <div className="grid grid-cols-[1fr_2fr] gap-4">
              {/* FORM POSTCODE INPUT */}
              <form.Field
                name="postcode"
                children={(field) => {
                  const isInvalid: boolean =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <InputGroup>
                        <InputGroupAddon>
                          <MapPin className="text-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="{field.name}"
                          name="{field.name}"
                          type="number"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Postnr."
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              {/* FORM CITY INPUT */}
              <form.Field
                name="city"
                children={(field) => {
                  const isInvalid: boolean =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <InputGroup>
                        <InputGroupAddon>
                          <Building2 className="text-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="{field.name}"
                          name="{field.name}"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Sted"
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="reset"
          variant="destructive"
          onClick={(e) => {
            e.preventDefault()
            form.reset()
          }}
        >
          Reset
        </Button>
        <Button
          type="submit"
          onClick={async () => {
            const customers = await getCustomers()
            console.log(customers)
          }}
        >
          Lagre Kunde
        </Button>
      </CardFooter>
    </Card>
  )
}
