import { useState } from 'react'
import * as z from 'zod'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import AddCustomerForm, {
  type AddCustomerFormValues,
} from '#/components/AddCustomerForm'
import { deleteCustomer, updateCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'

const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullable(),
  business: z.string().nullable(),
  address: z.string().nullable(),
  postcode: z.string().nullable(),
  city: z.string().nullable(),
  careof: z.string().nullable(),
})

export type Customer = z.infer<typeof customerSchema>

function DeleteCustomerCell({ row }: { row: Row<Customer> }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })

  async function handleConfirm() {
    await deleteMutation.mutateAsync(row.original.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="size-4" />
          <span className="sr-only">Slett kunde</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slett kunde</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil slette{' '}
            <span className="font-medium">{row.original.name}</span>? Dette er
            permanent og kan ikke angres.
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
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Sletter...' : 'Slett'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditCustomerCell({ row }: { row: Row<Customer> }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (values: AddCustomerFormValues) =>
      updateCustomer({ data: { id: row.original.id, ...values } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })

  const defaultValues: AddCustomerFormValues = {
    name: row.original.name,
    phone: row.original.phone ?? '',
    company: row.original.business ?? '',
    address: row.original.address ?? '',
    postcode: row.original.postcode ?? '',
    city: row.original.city ?? '',
    careof: row.original.careof ?? '',
  }

  async function handleEdit(values: AddCustomerFormValues) {
    await updateMutation.mutateAsync(values)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SquarePen className="size-4" />
          <span className="sr-only">Rediger kunde</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rediger kunde</DialogTitle>
        </DialogHeader>
        <AddCustomerForm
          saveText="Lagre"
          close
          disabled={updateMutation.isPending}
          defaultValues={defaultValues}
          onSubmit={handleEdit}
        />
      </DialogContent>
    </Dialog>
  )
}

export const customerColumns: ColumnDef<Customer>[] = [
  { accessorKey: 'name', header: 'Navn' },
  { accessorKey: 'phone', header: 'Telefon' },
  { accessorKey: 'business', header: 'Firma' },
  { accessorKey: 'address', header: 'Adresse' },
  { accessorKey: 'postcode', header: 'Postnr.' },
  { accessorKey: 'city', header: 'Sted' },
  { accessorKey: 'careof', header: 'C/O' },
  {
    id: 'edit',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row }) => <EditCustomerCell row={row} />,
  },
  {
    id: 'action',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row }) => <DeleteCustomerCell row={row} />,
  },
]
