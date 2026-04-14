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

import AddProductForm, {
  type AddProductFormValues,
} from '#/components/AddProductForm'
import { deleteProduct, updateProduct } from '#/lib/product-server-fns'
import { queryKeys } from '#/lib/query-keys'

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  price: z.string(),
})

export type Product = z.infer<typeof productSchema>

function DeleteProductCell({ row }: { row: Row<Product> }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
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
          <span className="sr-only">Slett produkt</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slett produkt</DialogTitle>
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

function EditProductCell({ row }: { row: Row<Product> }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

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
    category: row.original.category ?? '',
    price: row.original.price ?? '',
  }

  async function handleEdit(values: AddProductFormValues) {
    await updateMutation.mutateAsync(values)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SquarePen className="size-4" />
          <span className="sr-only">Rediger produkt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rediger produkt</DialogTitle>
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
  )
}

export const productColumns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Navn' },
  { accessorKey: 'category', header: 'Kategori' },
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
    id: 'edit',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row }) => <EditProductCell row={row} />,
  },
  {
    id: 'action',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row }) => <DeleteProductCell row={row} />,
  },
]
