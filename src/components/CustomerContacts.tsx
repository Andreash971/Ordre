import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'
import {
  CornerDownRight,
  Phone,
  SquarePen,
  Trash2,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { TableCell, TableRow } from '@/components/ui/table'

import FormInputField from '@/components/FormInputField'
import type { Contact } from '@/lib/contact-server-fns'
import {
  deleteContact,
  insertContact,
  updateContact,
} from '@/lib/contact-server-fns'
import { queryKeys } from '@/lib/query-keys'

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Navn er påkrevd')
    .max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  careof: z.string().max(50, 'C/O kan ikke være lengre enn 50 tegn'),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

/** Which representative a contact editor should start on. */
export type ContactEditTarget = number | 'new' | null

function ContactForm({
  defaultValues,
  disabled,
  saveText,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<ContactFormValues>
  disabled?: boolean
  saveText: string
  onSubmit: (values: ContactFormValues) => Promise<void> | void
  onCancel: () => void
}) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      careof: defaultValues?.careof ?? '',
    },
    validators: {
      onSubmit: contactFormSchema,
      onChange: contactFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex flex-col gap-3">
        <form.Field name="name">
          {(field) => (
            <FormInputField
              field={field}
              id="contact-name"
              icon={<User className="text-foreground" />}
              placeholder="Navn"
              disabled={disabled}
              autoComplete="off"
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <FormInputField
              field={field}
              id="contact-phone"
              icon={<Phone className="text-foreground" />}
              placeholder="Telefon"
              type="tel"
              disabled={disabled}
              autoComplete="off"
            />
          )}
        </form.Field>
        <form.Field name="careof">
          {(field) => (
            <FormInputField
              field={field}
              id="contact-careof"
              icon={<UserCheck className="text-foreground" />}
              placeholder="C/O"
              disabled={disabled}
              autoComplete="off"
            />
          )}
        </form.Field>
      </FieldGroup>
      <div className="flex justify-end gap-2 mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onCancel}
        >
          Avbryt
        </Button>
        <Button type="submit" size="sm" disabled={disabled}>
          {saveText}
        </Button>
      </div>
    </form>
  )
}

function DeleteContactDialog({
  contact,
  onOpenChange,
  onConfirm,
  pending,
}: {
  contact: Contact | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  pending: boolean
}) {
  return (
    <Dialog open={contact !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slett representant</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil slette{' '}
            <span className="font-medium">{contact?.name}</span>? Dette er
            permanent og kan ikke angres.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={pending}>
              Avbryt
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Sletter...' : 'Slett'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function useContactMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContact({ data: id }),
    onSuccess: invalidate,
  })
  return { invalidate, deleteMutation }
}

/**
 * A company's representatives with inline add/edit/delete — used in the
 * customer detail sheet. `initialEditing` opens the editor directly on one
 * representative (or 'new').
 */
export function ContactList({
  customerId,
  contacts,
  initialEditing = null,
}: {
  customerId: number
  contacts: Contact[]
  initialEditing?: ContactEditTarget
}) {
  const [editing, setEditing] = useState<ContactEditTarget>(initialEditing)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const { invalidate, deleteMutation } = useContactMutations()

  const saveMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      if (editing !== null && editing !== 'new') {
        await updateContact({ data: { id: editing, customerId, ...values } })
      } else {
        await insertContact({ data: { customerId, ...values } })
      }
    },
    onSuccess: invalidate,
  })

  async function handleSave(values: ContactFormValues) {
    await saveMutation.mutateAsync(values)
    setEditing(null)
  }

  function handleConfirmDelete() {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {contacts.length === 0 && editing !== 'new' && (
        <p className="text-sm text-muted-foreground">
          Ingen representanter registrert.
        </p>
      )}
      {contacts.map((contact) =>
        editing === contact.id ? (
          <div key={contact.id} className="rounded-md border bg-muted/30 p-3">
            <ContactForm
              saveText="Lagre"
              disabled={saveMutation.isPending}
              defaultValues={{
                name: contact.name,
                phone: contact.phone ?? '',
                careof: contact.careof ?? '',
              }}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <div
            key={contact.id}
            className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{contact.name}</div>
              {(contact.phone || contact.careof) && (
                <div className="truncate text-xs text-muted-foreground">
                  {[contact.phone, contact.careof && `C/O ${contact.careof}`]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(contact.id)}
              >
                <SquarePen className="size-4" />
                <span className="sr-only">Rediger representant</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => setDeleting(contact)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Slett representant</span>
              </Button>
            </div>
          </div>
        ),
      )}

      {editing === 'new' ? (
        <div className="rounded-md border bg-muted/30 p-3">
          <ContactForm
            saveText="Legg til"
            disabled={saveMutation.isPending}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 self-start"
          onClick={() => setEditing('new')}
        >
          <UserPlus />
          Legg til representant
        </Button>
      )}

      <DeleteContactDialog
        contact={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        onConfirm={handleConfirmDelete}
        pending={deleteMutation.isPending}
      />
    </div>
  )
}

/**
 * Representative rows rendered directly below a company row in the Firma
 * table. Always visible; visually set off from the company row.
 */
export function ContactSubRows({
  contacts,
  colSpan,
  onEditContact,
}: {
  contacts: Contact[]
  colSpan: number
  onEditContact: (contactId: number) => void
}) {
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const { deleteMutation } = useContactMutations()

  function handleConfirmDelete() {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  if (contacts.length === 0) return null

  return (
    <>
      {contacts.map((contact) => (
        <TableRow
          key={`contact-${contact.id}`}
          className="bg-muted/40 hover:bg-muted/50"
        >
          <TableCell colSpan={Math.max(colSpan - 1, 1)} className="py-1.5">
            <div className="flex items-center gap-2 pl-6 min-w-0">
              <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">{contact.name}</span>
              {contact.phone && (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {contact.phone}
                </span>
              )}
              {contact.careof && (
                <span className="truncate text-xs text-muted-foreground">
                  C/O {contact.careof}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="w-0 whitespace-nowrap py-1.5">
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEditContact(contact.id)}
              >
                <SquarePen className="size-4" />
                <span className="sr-only">Rediger representant</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => setDeleting(contact)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Slett representant</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
      <DeleteContactDialog
        contact={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        onConfirm={handleConfirmDelete}
        pending={deleteMutation.isPending}
      />
    </>
  )
}
