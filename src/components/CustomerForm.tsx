import { useForm } from '@tanstack/react-form'
import { useId } from 'react'
import * as z from 'zod'

import {
  BriefcaseBusiness,
  Building2,
  House,
  MapPin,
  Phone,
  User,
  Save,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'

import AutocompleteField from '#/components/AutocompleteField'
import FormInputField from '#/components/FormInputField'
import {
  type CustomerSuggestion,
  searchCustomers,
  searchCustomersByBusiness,
  searchCustomersByPhone,
} from '#/lib/customer-server-fns'

type CustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
}

interface CustomerFormProps {
  className?: string
  size: 'default' | 'sm'
  formButtons?: boolean
  reset?: boolean
  disabled?: boolean
  defaultValues?: Partial<CustomerFormValues>
  onValuesChange?: (values: CustomerFormValues) => void
}

const formSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
})

function CustomerSuggestionItem({
  customer,
}: {
  customer: CustomerSuggestion
}) {
  return (
    <>
      <span className="font-medium">{customer.name}</span>
      {(customer.phone || customer.business) && (
        <span className="text-xs text-muted-foreground flex gap-1.5 mt-0.5">
          {customer.phone && <span>{customer.phone}</span>}
          {customer.phone && customer.business && <span>|</span>}
          {customer.business && <span>{customer.business}</span>}
        </span>
      )}
    </>
  )
}

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

export default function CustomerForm({
  className,
  formButtons = false,
  reset = false,
  size,
  disabled,
  defaultValues: initialValues,
  onValuesChange,
}: CustomerFormProps) {
  const formId = useId()

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      phone: initialValues?.phone ?? '',
      company: initialValues?.company ?? '',
      address: initialValues?.address ?? '',
      postcode: initialValues?.postcode ?? '',
      city: initialValues?.city ?? '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        onValuesChange?.(formApi.state.values)
        if (formApi.state.isValid) {
          formApi.handleSubmit()
        }
      },
    },
  })

  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex flex-col gap-4">
        <form.Field name="name">
          {(field) => (
            <AutocompleteField
              field={field}
              id={`${formId}-name`}
              icon={<User className="text-foreground" />}
              placeholder="Navn"
              disabled={disabled}
              onSearch={(q) => searchCustomers({ data: q })}
              onSelect={(c) => fillForm(form, c)}
              renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
            />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <AutocompleteField
              field={field}
              id={`${formId}-phone`}
              icon={<Phone className="text-foreground" />}
              placeholder="Telefon"
              type="tel"
              disabled={disabled}
              onSearch={(q) => searchCustomersByPhone({ data: q })}
              onSelect={(c) => fillForm(form, c)}
              renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
            />
          )}
        </form.Field>

        <form.Field name="company">
          {(field) => (
            <AutocompleteField
              field={field}
              id={`${formId}-company`}
              icon={<BriefcaseBusiness className="text-foreground" />}
              placeholder="Firma"
              disabled={disabled}
              onSearch={(q) => searchCustomersByBusiness({ data: q })}
              onSelect={(c) => fillForm(form, c)}
              renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
            />
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-address`}
              icon={<House className="text-foreground" />}
              placeholder="Adresse"
              disabled={disabled}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <form.Field name="postcode">
            {(field) => (
              <FormInputField
                field={field}
                id={`${formId}-postcode`}
                icon={<MapPin className="text-foreground" />}
                placeholder="Postnr."
                type="number"
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.Field name="city">
            {(field) => (
              <FormInputField
                field={field}
                id={`${formId}-city`}
                icon={<Building2 className="text-foreground" />}
                placeholder="Sted"
                disabled={disabled}
              />
            )}
          </form.Field>
        </div>
      </FieldGroup>
    </form>
  )

  const buttons = formButtons && (
    <>
      {reset && (
        <Button
          type="reset"
          variant="destructive"
          onClick={(e) => {
            e.preventDefault()
            form.reset()
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit">
              <Save className="h-4 w-4" />
              Lagre
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lagre kundens informasjon i systemet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )

  return (
    <Card size={size} className={className}>
      <CardHeader>
        <CardTitle>Kundeinformasjon</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
      {formButtons && (
        <CardFooter className="flex justify-end gap-2">{buttons}</CardFooter>
      )}
    </Card>
  )
}
