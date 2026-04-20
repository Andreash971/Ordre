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
  UserCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { DialogClose } from '@/components/ui/dialog'

import FormInputField from '#/components/FormInputField'

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

        <form.Field name="careof">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-careof`}
              icon={<UserCheck className="text-foreground" />}
              placeholder="C/O"
              disabled={disabled}
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
