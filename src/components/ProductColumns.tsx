import { useState } from 'react'
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

import type { AddProductFormValues } from '#/components/AddProductForm'
import AddProductForm from '#/components/AddProductForm'
import type { Product } from '#/lib/api-types'
import { deleteProduct, updateProduct } from '#/lib/product-server-fns'
import { queryKeys } from '#/lib/query-keys'

export type { Product }

function ProductActionsCell({ row }: { row: Row<Product> }) {
  const queryClient = useQueryClient()
  const { isInSheet, openSheet, closeSheet } = useDataTableSheet()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })

  const updateMutation = useMutation({
    mutationFn: (values: AddProductFormValues) =>
      updateProduct({
        data: { id: row.original.id, ...values, price: Number(values.price) },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })

  const defaultValues: AddProductFormValues = {
    name: row.original.name,
    category: row.original.category,
    price: String(row.original.price),
    description: row.original.description ?? '',
  }

  async function handleEdit(values: AddProductFormValues) {
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
            <DialogTitle>Rediger vare</DialogTitle>
            <DialogDescription>Oppdater vareinformasjonen.</DialogDescription>
          </DialogHeader>
          <AddProductForm
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
            <DialogTitle>Slett vare</DialogTitle>
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

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Vare',
    meta: { priority: 'primary', truncate: true, className: 'max-w-[20rem]' },
    cell: ({ row }) => (
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{row.original.name}</span>
        {row.original.description ? (
          <span className="text-xs text-muted-foreground truncate">
            {row.original.description}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    meta: { truncate: true, className: 'max-w-[10rem]' },
  },
  {
    accessorKey: 'price',
    header: 'Pris',
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('no-NB', {
        style: 'currency',
        currency: 'NOK',
      }).format(Number(row.original.price))

      return <div>{formatted}</div>
    },
  },
  {
    id: 'actions',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap', action: true },
    cell: ({ row }) => <ProductActionsCell row={row} />,
  },
]
