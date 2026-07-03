import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useId } from 'react'
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
import FormInputField from '@/components/FormInputField'
import { lookupPostcode, suggestAddresses } from '@/lib/bring-server-fns'
import type { AddressSuggestion } from '@/lib/bring-server-fns'

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
  onSubmit: (values: AddCustomerFormValues) => Promise<void> | void
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

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Navn er påkrevd')
    .max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
  careof: z.string().max(50, 'C/O kan ikke være lengre enn 50 tegn'),
})

export default function AddCustomerForm({
  saveText,
  disabled,
  reset,
  close,
  defaultValues: initialValues,
  onSubmit,
}: AddCustomerFormProps) {
  const formId = useId()

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
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const postcode = useStore(form.store, (s) => s.values.postcode)

  const { data: bringLookup } = useQuery({
    queryKey: ['bring-postcode', postcode],
    queryFn: () => lookupPostcode({ data: postcode }),
    enabled: /^\d{4}$/.test(postcode),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (bringLookup?.city) {
      form.setFieldValue('city', bringLookup.city)
    }
  }, [bringLookup?.city])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex flex-col gap-4">
        <form.Field name="name">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-name`}
              icon={<User className="text-foreground" />}
              placeholder="Navn"
              disabled={disabled}
              autoComplete="name"
            />
          )}
        </form.Field>

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

        <form.Field name="company">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-company`}
              icon={<BriefcaseBusiness className="text-foreground" />}
              placeholder="Firma"
              disabled={disabled}
              autoComplete="organization"
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
