'use client'

import { useState } from 'react'
import type { ColumnDef, Row, Table } from '@tanstack/react-table'
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
import {
  type Customer,
  deleteCustomer,
  updateCustomer,
} from '#/lib/customer-server-fns'

function DeleteCustomerCell({
  row,
  table,
}: {
  row: Row<Customer>
  table: Table<Customer>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await deleteCustomer({ data: row.original.id })
      table.options.meta?.removeRow(row.index)
    } finally {
      setIsPending(false)
      setOpen(false)
    }
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
            <Button variant="ghost" disabled={isPending}>
              Avbryt
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Sletter...' : 'Slett'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditCustomerCell({
  row,
  table,
}: {
  row: Row<Customer>
  table: Table<Customer>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

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
    setIsPending(true)
    try {
      await updateCustomer({ data: { id: row.original.id, ...values } })
      table.options.meta?.updateRow(row.index, {
        name: values.name,
        phone: values.phone || null,
        business: values.company || null,
        address: values.address || null,
        postcode: values.postcode || null,
        city: values.city || null,
        careof: values.careof || null,
      })
      setOpen(false)
    } finally {
      setIsPending(false)
    }
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
          disabled={isPending}
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
    cell: ({ row, table }) => (
      <EditCustomerCell row={row} table={table as Table<Customer>} />
    ),
  },
  {
    id: 'action',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row, table }) => (
      <DeleteCustomerCell row={row} table={table as Table<Customer>} />
    ),
  },
]
