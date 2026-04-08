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

import AddProductForm, {
  type AddProductFormValues,
} from '#/components/AddProductForm'
import {
  type Product,
  deleteProduct,
  updateProduct,
} from '#/lib/product-server-fns'

function DeleteProductCell({
  row,
  table,
}: {
  row: Row<Product>
  table: Table<Product>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await deleteProduct({ data: row.original.id })
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

function EditProductCell({
  row,
  table,
}: {
  row: Row<Product>
  table: Table<Product>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const defaultValues: AddProductFormValues = {
    name: row.original.name,
    category: row.original.category ?? '',
    price: row.original.price ?? '',
  }

  async function handleEdit(values: AddProductFormValues) {
    setIsPending(true)
    try {
      await updateProduct({
        data: { id: row.original.id, ...values, price: Number(values.price) },
      })
      table.options.meta?.updateRow(row.index, {
        name: values.name,
        category: values.category || null,
        price: values.price,
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
          disabled={isPending}
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
  { accessorKey: 'price', header: 'Pris' },
  {
    id: 'edit',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row, table }) => (
      <EditProductCell row={row} table={table as Table<Product>} />
    ),
  },
  {
    id: 'action',
    header: '',
    meta: { className: 'w-0 whitespace-nowrap' },
    cell: ({ row, table }) => (
      <DeleteProductCell row={row} table={table as Table<Product>} />
    ),
  },
]
