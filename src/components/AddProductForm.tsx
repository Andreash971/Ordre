import { useForm } from '@tanstack/react-form'
import { useId } from 'react'
import * as z from 'zod'

import { CreditCard, FolderOpen, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'

import FormInputField from '#/components/FormInputField'
import { DialogClose } from './ui/dialog'

export type AddProductFormValues = {
  name: string
  category: string
  price: string
}

interface AddProductFormProps {
  saveText?: string
  disabled?: boolean
  reset?: boolean
  close?: boolean
  defaultValues?: Partial<AddProductFormValues>
  onSubmit: (values: AddProductFormValues) => Promise<void> | void
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Navn er påkrevd')
    .max(100, 'Navn kan ikke være lengre enn 100 tegn'),
  category: z.string().max(50, 'Kategori kan ikke være lengre enn 50 tegn'),
  price: z
    .string()
    .min(1, 'Pris er påkrevd')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Ugyldig pris'),
})

export default function AddProductForm({
  saveText,
  disabled,
  reset,
  close,
  defaultValues: initialValues,
  onSubmit,
}: AddProductFormProps) {
  const formId = useId()

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? '',
      price: initialValues?.price ?? '',
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
              icon={<Package className="text-foreground" />}
              placeholder="Navn"
              disabled={disabled}
            />
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-category`}
              icon={<FolderOpen className="text-foreground" />}
              placeholder="Kategori"
              disabled={disabled}
            />
          )}
        </form.Field>

        <form.Field name="price">
          {(field) => (
            <FormInputField
              field={field}
              id={`${formId}-price`}
              icon={<CreditCard className="text-foreground" />}
              placeholder="Pris"
              type="number"
              disabled={disabled}
            />
          )}
        </form.Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 mt-4">
        {close && (
          <DialogClose>
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
