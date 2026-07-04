import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import type { AddCustomerFormValues } from '@/components/AddCustomerForm'
import AddCustomerForm from '@/components/AddCustomerForm'
import { ContactList } from '@/components/CustomerContacts'
import type { ContactEditTarget } from '@/components/CustomerContacts'
import type { CustomerRow } from '@/components/CustomerColumns'
import { deleteCustomer } from '@/lib/customer-server-fns'
import { useSaveCustomerMutation } from '@/hooks/use-save-customer-mutation'
import { queryKeys } from '@/lib/query-keys'

function CustomerDetail({
  customer,
  editContactId,
  onClose,
}: {
  customer: CustomerRow
  editContactId: ContactEditTarget
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const isBusiness = customer.type === 'business'
  const saveMutation = useSaveCustomerMutation()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer({ data: id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
    },
  })

  // Business rep fields live in the Representanter section below, not the
  // company form — blank them so a save never touches contacts.
  const defaultValues: AddCustomerFormValues = {
    name: isBusiness ? '' : customer.name,
    phone: isBusiness ? '' : (customer.phone ?? ''),
    company: customer.company ?? '',
    address: customer.address ?? '',
    postcode: customer.postcode ?? '',
    city: customer.city ?? '',
    careof: isBusiness ? '' : (customer.careof ?? ''),
  }

  async function handleSave(values: AddCustomerFormValues) {
    await saveMutation.mutateAsync({
      values,
      selection: {
        type: customer.type,
        customerId: customer.id,
        contactId: null,
      },
    })
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(customer.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        onClose()
      },
    })
  }

  const title = isBusiness
    ? customer.company || customer.name
    : customer.name || 'Uten navn'

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {isBusiness ? 'Firmakunde' : 'Privatkunde'}
        </div>
        <SheetTitle className="font-heading text-xl">{title}</SheetTitle>
        <SheetDescription>
          {[
            customer.address,
            [customer.postcode, customer.city].filter(Boolean).join(' '),
          ]
            .filter(Boolean)
            .join(', ') || 'Ingen adresse registrert'}
        </SheetDescription>
      </SheetHeader>

      <div className="rounded-lg border p-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {isBusiness ? 'Firmainformasjon' : 'Kundeinformasjon'}
        </div>
        <AddCustomerForm
          key={customer.id}
          saveText="Lagre"
          disabled={saveMutation.isPending}
          defaultValues={defaultValues}
          defaultType={customer.type}
          allowTypeSwitch={false}
          withRepresentative={false}
          onSubmit={handleSave}
        />
      </div>

      {isBusiness && (
        <div className="rounded-lg border p-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Representanter
          </div>
          <ContactList
            key={`${customer.id}-${String(editContactId)}`}
            customerId={customer.id}
            contacts={customer.contacts}
            initialEditing={editContactId}
          />
        </div>
      )}

      <div className="flex justify-start">
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          {isBusiness ? 'Slett firma' : 'Slett kunde'}
        </Button>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBusiness ? 'Slett firma' : 'Slett kunde'}
            </DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette{' '}
              <span className="font-medium">{title}</span>?{' '}
              {isBusiness && 'Alle firmaets representanter slettes også. '}
              Dette er permanent og kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleteMutation.isPending}>
                Avbryt
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Sletter...' : 'Slett'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Sidebar sheet for viewing/editing a customer (mirrors the archive page's
 * detail sheet). For business customers it includes representative
 * management; `editContactId` opens directly on one representative.
 */
export function CustomerSheet({
  customer,
  editContactId,
  onOpenChange,
}: {
  customer: CustomerRow | null
  editContactId: ContactEditTarget
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={customer !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {customer ? (
          <CustomerDetail
            customer={customer}
            editContactId={editContactId}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
