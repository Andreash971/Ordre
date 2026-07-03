import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
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
  UserCheck,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TooltipWrapper } from '@/components/ui/TooltipWrapper'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'

import AutocompleteField from '@/components/AutocompleteField'
import FormInputField from '@/components/FormInputField'
import type { CustomerSuggestion } from '@/lib/customer-server-fns'
import {
  searchCustomers,
  searchCustomersByBusiness,
  searchCustomersByPhone,
} from '@/lib/customer-server-fns'
import { lookupPostcode, suggestAddresses } from '@/lib/bring-server-fns'
import type { AddressSuggestion } from '@/lib/bring-server-fns'
import { queryKeys } from '@/lib/query-keys'
import type { CustomerFormValues } from '@/lib/order-utils'

interface CustomerFormProps {
  className?: string
  size?: 'default' | 'sm'
  formButtons?: boolean
  reset?: boolean
  disabled?: boolean
  showCareof?: boolean
  bare?: boolean
  hideHeader?: boolean
  hideSaveButton?: boolean
  defaultValues?: Partial<CustomerFormValues>
  onValuesChange?: (values: CustomerFormValues) => void
  onIdChange?: (id: number | null) => void
  onSubmit?: (
    values: CustomerFormValues,
    ctx: { id: number | null },
  ) => Promise<void> | void
}

const formSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
  careof: z.string().max(50, 'C/O person kan ikke være lengre enn 50 tegn'),
})

function CustomerSuggestionItem({
  customer,
}: {
  customer: CustomerSuggestion
}) {
  return (
    <>
      <span className="font-medium">{customer.name}</span>
      {(customer.phone || customer.company) && (
        <span className="text-xs flex gap-1.5 mt-0.5">
          {customer.phone && <span>{customer.phone}</span>}
          {customer.phone && customer.company && <span>|</span>}
          {customer.company && <span>{customer.company}</span>}
        </span>
      )}
    </>
  )
}

function formatAddress(address: AddressSuggestion) {
  return `${address.street_name}${address.house_number != null ? ` ${address.house_number}` : ''}${address.letter ?? ''}`
}

function AddressSuggestionItem({ address }: { address: AddressSuggestion }) {
  return (
    <>
      <span className="font-medium">{formatAddress(address)}</span>
      <span className="text-xs flex gap-1.5 mt-0.5">
        <span>{`${address.postal_code} ${address.city}`}</span>
        {address.municipality && (
          <>
            <span>|</span>
            <span>{address.municipality}</span>
          </>
        )}
      </span>
    </>
  )
}

function fillForm(
  form: {
    setFieldValue: (
      field:
        | 'name'
        | 'phone'
        | 'company'
        | 'address'
        | 'postcode'
        | 'city'
        | 'careof',
      value: string,
    ) => void
  },
  customer: CustomerSuggestion,
  setSelectedId: (id: number | null) => void,
) {
  setSelectedId(customer.id)
  form.setFieldValue('name', customer.name)
  form.setFieldValue('phone', customer.phone ?? '')
  form.setFieldValue('company', customer.company ?? '')
  form.setFieldValue('address', customer.address ?? '')
  form.setFieldValue('postcode', customer.postcode ?? '')
  form.setFieldValue('city', customer.city ?? '')
  form.setFieldValue('careof', customer.careof ?? '')
}

export default function CustomerForm({
  className,
  formButtons = false,
  reset = false,
  size,
  disabled,
  showCareof = false,
  bare = false,
  hideHeader = false,
  hideSaveButton = false,
  defaultValues: initialValues,
  onValuesChange,
  onIdChange,
  onSubmit,
}: CustomerFormProps) {
  const formId = useId()
  const selectedIdRef = useRef<number | null>(null)
  const onIdChangeRef = useRef(onIdChange)
  useEffect(() => {
    onIdChangeRef.current = onIdChange
  }, [onIdChange])
  const setSelectedId = (id: number | null) => {
    if (selectedIdRef.current === id) return
    selectedIdRef.current = id
    onIdChangeRef.current?.(id)
  }
  const [justSaved, setJustSaved] = useState(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    },
    [],
  )

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      phone: initialValues?.phone ?? '',
      company: initialValues?.company ?? '',
      address: initialValues?.address ?? '',
      postcode: initialValues?.postcode ?? '',
      city: initialValues?.city ?? '',
      careof: initialValues?.careof ?? '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        if (!formApi.state.values.name) {
          setSelectedId(null)
        }
        onValuesChange?.(formApi.state.values)
      },
    },
    onSubmit: async ({ value }) => {
      if (!onSubmit) return
      await onSubmit(value, { id: selectedIdRef.current })
      setJustSaved(true)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setJustSaved(false), 2000)
    },
  })

  const postcode = useStore(form.store, (s) => s.values.postcode)
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)

  const { data: bringLookup } = useQuery({
    queryKey: queryKeys.bring.postcode(postcode),
    queryFn: () => lookupPostcode({ data: postcode }),
    enabled: /^\d{4}$/.test(postcode),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (bringLookup?.city) {
      form.setFieldValue('city', bringLookup.city)
    }
  }, [bringLookup?.city])

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
              autoComplete="name"
              onSearch={(q) => searchCustomers({ data: q })}
              onSelect={(c) => fillForm(form, c, setSelectedId)}
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
              autoComplete="tel"
              onSearch={(q) => searchCustomersByPhone({ data: q })}
              onSelect={(c) => fillForm(form, c, setSelectedId)}
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
              autoComplete="organization"
              onSearch={(q) => searchCustomersByBusiness({ data: q })}
              onSelect={(c) => fillForm(form, c, setSelectedId)}
              renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
            />
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <AutocompleteField
              field={field}
              id={`${formId}-address`}
              icon={<House className="text-foreground" />}
              placeholder="Adresse"
              disabled={disabled}
              autoComplete="street-address"
              onSearch={(q) => suggestAddresses({ data: q })}
              onSelect={(a) => {
                form.setFieldValue('address', formatAddress(a))
                form.setFieldValue('postcode', a.postal_code)
                form.setFieldValue('city', a.city)
              }}
              renderSuggestion={(a) => <AddressSuggestionItem address={a} />}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-[minmax(6rem,1fr)_minmax(6rem,2fr)] gap-4">
          <form.Field name="postcode">
            {(field) => (
              <FormInputField
                field={field}
                id={`${formId}-postcode`}
                icon={<MapPin className="text-foreground" />}
                placeholder="Postnr."
                type="number"
                disabled={disabled}
                autoComplete="postal-code"
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
                autoComplete="address-level2"
              />
            )}
          </form.Field>
        </div>

        {showCareof && (
          <form.Field name="careof">
            {(field) => (
              <FormInputField
                field={field}
                id={`${formId}-careof`}
                icon={<UserCheck className="text-foreground" />}
                placeholder="C/O"
                disabled={disabled}
                autoComplete="off"
              />
            )}
          </form.Field>
        )}
      </FieldGroup>
    </form>
  )

  const hasButtons = formButtons && (reset || !hideSaveButton)

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
          disabled={disabled}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}
      {!hideSaveButton && (
        <TooltipWrapper TooltipText={'Lagre kundens informasjon i systemet'}>
          <Button
            type="submit"
            disabled={disabled || isSubmitting}
            onClick={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className={cn(
              'transition-colors',
              justSaved &&
                'bg-green-600 text-white hover:bg-green-600 focus-visible:ring-green-600',
            )}
          >
            {justSaved ? (
              <>
                <Check className="h-4 w-4" />
                Lagret
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lagre
              </>
            )}
          </Button>
        </TooltipWrapper>
      )}
    </>
  )

  if (bare) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {formContent}
        {hasButtons && <div className="flex justify-end gap-2">{buttons}</div>}
      </div>
    )
  }

  return (
    <Card size={size} className={cn('min-w-60', className)}>
      {!hideHeader && (
        <CardHeader>
          <CardTitle>Kundeinformasjon</CardTitle>
        </CardHeader>
      )}
      <CardContent>{formContent}</CardContent>
      {hasButtons && (
        <CardFooter className="flex justify-end gap-2">{buttons}</CardFooter>
      )}
    </Card>
  )
}
