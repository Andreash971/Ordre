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
  UserCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { DialogClose } from '@/components/ui/dialog'

import AutocompleteField from '@/components/AutocompleteField'
import CustomerTypeTabs from '@/components/CustomerTypeTabs'
import FormInputField from '@/components/FormInputField'
import { lookupPostcode, suggestAddresses } from '@/lib/bring-server-fns'
import type { AddressSuggestion } from '@/lib/bring-server-fns'
import type {
  CustomerSuggestion,
  CustomerType,
} from '@/lib/customer-server-fns'
import { searchCustomersByBusiness } from '@/lib/customer-server-fns'
import type { CustomerSelection } from '@shared/customers'
import { clampCustomerType } from '@shared/modules'
import { queryKeys } from '@/lib/query-keys'
import { useEnabledCustomerTypes, useModules } from '@/lib/store-hooks'

export type AddCustomerFormValues = {
  name: string
  phone: string
  company: string
  address: string
  postcode: string
  city: string
  careof: string
}

interface AddCustomerFormProps {
  saveText?: string
  disabled?: boolean
  reset?: boolean
  close?: boolean
  defaultValues?: Partial<AddCustomerFormValues>
  defaultType?: CustomerType
  /** Show the Privat/Firma tab; disable when editing (type is fixed). */
  allowTypeSwitch?: boolean
  /**
   * Business only: include representative fields (name/phone/careof) so a new
   * company is created with its first contact. Off when editing a company —
   * representatives are managed on the company's detail sheet.
   */
  withRepresentative?: boolean
  /**
   * Business only: let the company field autocomplete against existing
   * business customers. Selecting one turns the submit into "add a
   * representative to that company" instead of creating a new one.
   */
  allowExistingCompany?: boolean
  onSubmit: (
    values: AddCustomerFormValues,
    selection: CustomerSelection,
  ) => Promise<void> | void
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

const baseSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
  careof: z.string().max(50, 'C/O kan ikke være lengre enn 50 tegn'),
})

/** The primary field is required: name for private, company for business. */
function schemaFor(type: CustomerType) {
  return type === 'business'
    ? baseSchema.extend({
        company: z
          .string()
          .min(1, 'Firma er påkrevd')
          .max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
      })
    : baseSchema.extend({
        name: z
          .string()
          .min(1, 'Navn er påkrevd')
          .max(50, 'Navn kan ikke være lengre enn 50 tegn'),
      })
}

export default function AddCustomerForm({
  saveText,
  disabled,
  reset,
  close,
  defaultValues: initialValues,
  defaultType = 'private',
  allowTypeSwitch = true,
  withRepresentative = true,
  allowExistingCompany = false,
  onSubmit,
}: AddCustomerFormProps) {
  const formId = useId()
  const modules = useModules()
  const enabledTypes = useEnabledCustomerTypes()
  // A fixed type (editing an existing customer) is respected even if its
  // module was disabled later; a new record starts on an enabled type.
  const [type, setType] = useState<CustomerType>(() =>
    allowTypeSwitch ? clampCustomerType(modules, defaultType) : defaultType,
  )
  const isBusiness = type === 'business'
  const visibleTypes = enabledTypes.includes(type)
    ? enabledTypes
    : [...enabledTypes, type]
  const showRepresentative = !isBusiness || withRepresentative

  // Existing company the business submit should target instead of creating a
  // new one. Typing a different company name breaks the link. The ref is the
  // source of truth so the form's synchronous change listener never reads a
  // stale value; the state mirror drives rendering.
  const [existingCompany, setExistingCompanyState] =
    useState<CustomerSuggestion | null>(null)
  const existingCompanyRef = useRef<CustomerSuggestion | null>(null)
  const setExistingCompany = (c: CustomerSuggestion | null) => {
    existingCompanyRef.current = c
    setExistingCompanyState(c)
  }

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
      onSubmit: schemaFor(type),
      onChange: schemaFor(type),
    },
    listeners: {
      onChange: ({ formApi }) => {
        const linked = existingCompanyRef.current
        if (
          linked &&
          formApi.state.values.company !== (linked.company ?? linked.name)
        ) {
          setExistingCompany(null)
        }
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value, {
        type,
        customerId:
          type === 'business' ? (existingCompanyRef.current?.id ?? null) : null,
        contactId: null,
      })
    },
  })

  function fillFromCompany(customer: CustomerSuggestion) {
    setExistingCompany(customer)
    form.setFieldValue('company', customer.company ?? customer.name)
    form.setFieldValue('address', customer.address ?? '')
    form.setFieldValue('postcode', customer.postcode ?? '')
    form.setFieldValue('city', customer.city ?? '')
  }

  const postcode = useStore(form.store, (s) => s.values.postcode)

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

  const nameField = showRepresentative && (
    <form.Field name="name">
      {(field) => (
        <FormInputField
          field={field}
          id={`${formId}-name`}
          icon={<User className="text-foreground" />}
          placeholder={isBusiness ? 'Representant' : 'Navn'}
          disabled={disabled}
          autoComplete={isBusiness ? 'off' : 'name'}
        />
      )}
    </form.Field>
  )

  const phoneField = showRepresentative && (
    <form.Field name="phone">
      {(field) => (
        <FormInputField
          field={field}
          id={`${formId}-phone`}
          icon={<Phone className="text-foreground" />}
          placeholder="Telefon"
          type="tel"
          disabled={disabled}
          autoComplete="tel"
        />
      )}
    </form.Field>
  )

  const companyField = (
    <div className="flex flex-col gap-1">
      <form.Field name="company">
        {(field) =>
          isBusiness && allowExistingCompany ? (
            <AutocompleteField
              field={field}
              id={`${formId}-company`}
              icon={<BriefcaseBusiness className="text-foreground" />}
              placeholder="Firma"
              disabled={disabled}
              autoComplete="organization"
              searchKey="customers-business-company"
              onSearch={(q) =>
                searchCustomersByBusiness({
                  data: { query: q, type: 'business' },
                })
              }
              onSelect={fillFromCompany}
              renderSuggestion={(c) => (
                <>
                  <span className="font-medium">{c.company || c.name}</span>
                  {(c.address || c.city) && (
                    <span className="text-xs flex gap-1.5 mt-0.5">
                      {[c.address, c.city].filter(Boolean).join(' | ')}
                    </span>
                  )}
                </>
              )}
            />
          ) : (
            <FormInputField
              field={field}
              id={`${formId}-company`}
              icon={<BriefcaseBusiness className="text-foreground" />}
              placeholder="Firma"
              disabled={disabled}
              autoComplete="organization"
            />
          )
        }
      </form.Field>
      {isBusiness && existingCompany && (
        <p className="text-xs text-muted-foreground">
          Eksisterende firma valgt — representanten legges til i{' '}
          <span className="font-medium">
            {existingCompany.company || existingCompany.name}
          </span>
          .
        </p>
      )}
    </div>
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex flex-col gap-4">
        {allowTypeSwitch && (
          <CustomerTypeTabs
            value={type}
            types={visibleTypes}
            disabled={disabled}
            onChange={(next) => {
              setType(next)
              if (next !== 'business') setExistingCompany(null)
            }}
            fullWidth
          />
        )}

        {isBusiness ? (
          <>
            {companyField}
            {nameField}
            {phoneField}
          </>
        ) : (
          <>
            {nameField}
            {phoneField}
            {companyField}
          </>
        )}

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

        {showRepresentative && (
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

      <div className="flex justify-end gap-2 mt-4">
        {close && (
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={disabled}>
              Lukk
            </Button>
          </DialogClose>
        )}
        {reset && (
          <Button
            type="reset"
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              form.reset()
            }}
            disabled={disabled}
          >
            Nullstill
          </Button>
        )}
        <Button type="submit" disabled={disabled}>
          {saveText ?? 'Lagre'}
        </Button>
      </div>
    </form>
  )
}
