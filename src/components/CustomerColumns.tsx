import { useState } from 'react'
import * as z from 'zod'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDataTableSheet } from '@/components/ui/DataTable'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { AddCustomerFormValues } from '#/components/AddCustomerForm'
import AddCustomerForm from '#/components/AddCustomerForm'
import { deleteCustomer, updateCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'

const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  address: z.string().nullable(),
  postcode: z.string().nullable(),
  city: z.string().nullable(),
  careof: z.string().nullable(),
})

export type Customer = z.infer<typeof customerSchema>

function CustomerActionsCell({ row }: { row: Row<Customer> }) {
  const queryClient = useQueryClient()
  const { isInSheet, openSheet, closeSheet } = useDataTableSheet()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })

  const updateMutation = useMutation({
    mutationFn: (values: AddCustomerFormValues) =>
      updateCustomer({ data: { id: row.original.id, ...values } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })

  const defaultValues: AddCustomerFormValues = {
    name: row.original.name,
    phone: row.original.phone ?? '',
    company: row.original.company ?? '',
    address: row.original.address ?? '',
    postcode: row.original.postcode ?? '',
    city: row.original.city ?? '',
    careof: row.original.careof ?? '',
  }

  async function handleEdit(values: AddCustomerFormValues) {
    await updateMutation.mutateAsync(values)
    setEditOpen(false)
    if (isInSheet) closeSheet()
  }

  async function handleConfirmDelete() {
    await deleteMutation.mutateAsync(row.original.id)
    setDeleteOpen(false)
    if (isInSheet) closeSheet()
  }

  return (
    <>
      {isInSheet ? (
        <>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <SquarePen />
            Rediger
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Slett
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Åpne handlinger</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openSheet(row.id)}>
              <Eye />
              Vis
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <SquarePen />
              Rediger
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Slett
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rediger kunde</DialogTitle>
            <DialogDescription>Oppdater kundens informasjon.</DialogDescription>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Sletter...' : 'Slett'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Navn',
    meta: { priority: 'primary', truncate: true, className: 'max-w-[16rem]' },
  },
  { accessorKey: 'phone', header: 'Telefon' },
  {
    accessorKey: 'company',
    header: 'Firma',
    meta: { truncate: true, className: 'max-w-[14rem]' },
  },
  {
    accessorKey: 'address',
    header: 'Adresse',
    meta: { truncate: true, className: 'max-w-[18rem]' },
  },
  { accessorKey: 'postcode', header: 'Postnr.' },
  {
    accessorKey: 'city',
    header: 'Sted',
    meta: { truncate: true, className: 'max-w-[10rem]' },
  },
  {
    accessorKey: 'careof',
    header: 'C/O',
    meta: { truncate: true, className: 'max-w-[10rem]' },
  },
  {
    id: 'actions',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap', action: true },
    cell: ({ row }) => <CustomerActionsCell row={row} />,
  },
]
