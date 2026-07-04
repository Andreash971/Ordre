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

import type { Product } from '@shared/products'
import { formatNok } from '@/lib/format'
import { deleteProduct } from '@/lib/product-server-fns'
import { queryKeys } from '@/lib/query-keys'

export type { Product }

export type ProductColumnCallbacks = {
  /** Open the detail/edit sheet for a product. */
  onOpen: (product: Product) => void
}

function ProductActionsCell({
  row,
  callbacks,
}: {
  row: Row<Product>
  callbacks: ProductColumnCallbacks
}) {
  const queryClient = useQueryClient()
  const { isInSheet, closeSheet } = useDataTableSheet()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
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

export function buildProductColumns(
  callbacks: ProductColumnCallbacks,
): ColumnDef<Product>[] {
  return [
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
      cell: ({ row }) => <div>{formatNok(Number(row.original.price))}</div>,
    },
    {
      id: 'actions',
      header: '',
      meta: { className: 'w-0 whitespace-nowrap', action: true },
      cell: ({ row }) => <ProductActionsCell row={row} callbacks={callbacks} />,
    },
  ]
}
