import { useState } from 'react'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react'

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

import type { Customer } from '@/lib/customer-server-fns'
import type { Contact } from '@/lib/contact-server-fns'
import { deleteCustomer } from '@/lib/customer-server-fns'
import { queryKeys } from '@/lib/query-keys'

/** A customer with its representatives joined in (empty for private). */
export type CustomerRow = Customer & { contacts: Contact[] }

export type CustomerColumnCallbacks = {
  /** Open the detail/edit sheet for a customer. */
  onOpen: (customer: CustomerRow) => void
}

function CustomerActionsCell({
  row,
  callbacks,
}: {
  row: Row<CustomerRow>
  callbacks: CustomerColumnCallbacks
}) {
  const queryClient = useQueryClient()
  const { isInSheet, closeSheet } = useDataTableSheet()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isBusiness = row.original.type === 'business'

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer({ data: id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
    },
  })

  function openEditor() {
    if (isInSheet) closeSheet()
    callbacks.onOpen(row.original)
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
          <Button variant="outline" size="sm" onClick={openEditor}>
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
            <DropdownMenuItem onSelect={openEditor}>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBusiness ? 'Slett firma' : 'Slett kunde'}
            </DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette{' '}
              <span className="font-medium">
                {isBusiness
                  ? row.original.company || row.original.name
                  : row.original.name}
              </span>
              ? {isBusiness && 'Alle firmaets representanter slettes også. '}
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
    </>
  )
}

function actionsColumn(
  callbacks: CustomerColumnCallbacks,
): ColumnDef<CustomerRow> {
  return {
    id: 'actions',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap', action: true },
    cell: ({ row }) => <CustomerActionsCell row={row} callbacks={callbacks} />,
  }
}

/** Private customers: the person's name is primary. */
export function buildPrivateColumns(
  callbacks: CustomerColumnCallbacks,
): ColumnDef<CustomerRow>[] {
  return [
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
    actionsColumn(callbacks),
  ]
}

/**
 * Business customers: the company is primary; representatives are rendered
 * as sub-rows below each company. The company column's filter value includes
 * representative names/phones so table search finds a firm via its people.
 */
export function buildBusinessColumns(
  callbacks: CustomerColumnCallbacks,
): ColumnDef<CustomerRow>[] {
  return [
    {
      id: 'company',
      header: 'Firma',
      accessorFn: (c) =>
        [
          c.company ?? c.name,
          ...c.contacts.map((k) => `${k.name} ${k.phone ?? ''}`),
        ].join(' '),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.company || row.original.name}
        </span>
      ),
      meta: { priority: 'primary', truncate: true, className: 'max-w-[16rem]' },
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
    actionsColumn(callbacks),
  ]
}
