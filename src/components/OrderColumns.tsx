import { useState } from 'react'
import * as z from 'zod'
import type { ColumnDef, Row, RowData, Table } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ChevronDown, ChevronUp, Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import AddProductForm from '#/components/AddProductForm'
import type { AddProductFormValues } from '#/components/AddProductForm'
import { insertProduct, updateProduct } from '#/lib/product-server-fns'
import { queryKeys } from '#/lib/query-keys'
import type { SpecialItemKey } from '#/lib/settings'
import { TOGGLE_DRIVEN_SPECIAL_KEYS } from '#/lib/special-items'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: keyof Item,
      value: string | number,
    ) => void
    removeRow: (rowIndex: number) => void
    updateRow: (rowIndex: number, values: Record<string, unknown>) => void
    removeSpecial?: (key: SpecialItemKey) => void
  }
}

const specialItemKeySchema = z.union([
  z.literal('frakt'),
  z.literal('leveringstid'),
  z.literal('kort'),
])

const itemSchema = z.object({
  productId: z.number().optional(),
  specialKey: specialItemKeySchema.optional(),
  name: z.string(),
  description: z.string().default(''),
  category: z.string().optional(),
  price: z.number(),
  quantity: z.number(),
  originalName: z.string().optional(),
  originalDescription: z.string().optional(),
  originalPrice: z.number().optional(),
})

export type Item = z.infer<typeof itemSchema>

function NameCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const { name, description } = row.original
  const isSpecial = row.original.specialKey != null
  const isNew = !isSpecial && row.original.productId == null
  const [isEditing, setIsEditing] = useState(isNew)
  const isMobile = useIsMobile()

  if (!isEditing) {
    return (
      <div
        className="flex flex-col cursor-default select-none min-w-0"
        onClick={isMobile ? () => setIsEditing(true) : undefined}
        onDoubleClick={!isMobile ? () => setIsEditing(true) : undefined}
      >
        {name ? (
          <span className="font-medium truncate">{name}</span>
        ) : (
          <span className="font-medium truncate text-muted-foreground italic">
            Ny vare
          </span>
        )}
        {description ? (
          <span className="text-xs text-muted-foreground whitespace-pre-wrap wrap-break-words">
            {description}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-1 min-w-0"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsEditing(false)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setIsEditing(false)
      }}
    >
      <Input
        value={name}
        autoFocus={!isNew || name === ''}
        placeholder="Navn"
        onChange={(e) =>
          table.options.meta?.updateData(row.index, 'name', e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setIsEditing(false)
          }
        }}
        className="font-medium"
      />
      {!isSpecial ? (
        <Textarea
          value={description}
          rows={2}
          placeholder="Beskrivelse (valgfri)"
          onChange={(e) =>
            table.options.meta?.updateData(
              row.index,
              'description',
              e.target.value,
            )
          }
          className="text-xs min-h-0"
        />
      ) : null}
    </div>
  )
}

function QuantityCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const isSpecial = row.original.specialKey != null
  const isNew = !isSpecial && row.original.productId == null
  const [isEditing, setIsEditing] = useState(isNew)
  const isMobile = useIsMobile()
  const quantity = row.original.quantity

  if (!isEditing) {
    return (
      <div
        className="flex justify-end cursor-default select-none"
        onClick={isMobile ? () => setIsEditing(true) : undefined}
        onDoubleClick={!isMobile ? () => setIsEditing(true) : undefined}
      >
        {quantity}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end">
      <Input
        type="number"
        min={0}
        value={quantity}
        placeholder="Antall"
        onChange={(e) =>
          table.options.meta?.updateData(
            row.index,
            'quantity',
            Math.max(0, Number(e.target.value)),
          )
        }
        onBlur={() => {
          if (quantity === 0) {
            if (row.original.specialKey && table.options.meta?.removeSpecial) {
              table.options.meta.removeSpecial(row.original.specialKey)
            } else {
              table.options.meta?.removeRow(row.index)
            }
            return
          }
          setIsEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className="w-16 text-right [appearance:textfield]"
      />
      <div className="ml-2 flex flex-col">
        <Button
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            table.options.meta?.updateData(row.index, 'quantity', quantity + 1)
          }
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            table.options.meta?.updateData(
              row.index,
              'quantity',
              Math.max(1, quantity - 1),
            )
          }
        >
          <ChevronDown className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

const nokFormatter = new Intl.NumberFormat('no-NB', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function PriceCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const isSpecial = row.original.specialKey != null
  const isNew = !isSpecial && row.original.productId == null
  const [isEditing, setIsEditing] = useState(isNew)
  const isMobile = useIsMobile()
  const price = row.original.price

  if (!isEditing) {
    return (
      <div
        className="flex justify-end cursor-default select-none"
        onClick={isMobile ? () => setIsEditing(true) : undefined}
        onDoubleClick={!isMobile ? () => setIsEditing(true) : undefined}
      >
        {nokFormatter.format(price)}
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <Input
        type="number"
        min={0}
        value={price}
        placeholder="Pris"
        onChange={(e) =>
          table.options.meta?.updateData(
            row.index,
            'price',
            Math.max(0, Number(e.target.value)),
          )
        }
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
        className="w-24 text-right [appearance:textfield]"
      />
    </div>
  )
}

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">Vare</div>,
    cell: ({ row, table }) => <NameCell row={row} table={table} />,
    meta: { priority: 'primary' },
  },
  {
    id: 'quantity',
    header: () => <div className="text-right ml-auto">Antall</div>,
    cell: ({ row, table }) => <QuantityCell row={row} table={table} />,
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right w-fit ml-auto">Pris/Stk</div>,
    cell: ({ row, table }) => <PriceCell row={row} table={table} />,
  },
  {
    id: 'total',
    header: () => <div className="text-right w-fit ml-auto">Total</div>,
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('no-NB', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(row.original.price * row.original.quantity)

      return <div className="text-right">{formatted}</div>
    },
    meta: { priority: 'primary' },
  },
  {
    id: 'action',
    header: () => <div className="text-right"></div>,
    meta: { action: true },
    cell: ({ row, table }) => <ActionCell row={row} table={table} />,
  },
]

function ActionCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const queryClient = useQueryClient()
  const item = row.original
  const isSpecial = item.specialKey != null
  const isNew = !isSpecial && item.productId == null
  const canSaveExisting =
    !isSpecial && item.productId != null && item.originalName != null

  const isDirty =
    canSaveExisting &&
    (item.name !== item.originalName ||
      item.description !== (item.originalDescription ?? '') ||
      item.price !== item.originalPrice)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProduct({
        data: {
          id: item.productId!,
          name: item.name,
          category: item.category ?? '',
          price: item.price,
          description: item.description,
        },
      }),
    onSuccess: () => {
      table.options.meta?.updateRow(row.index, {
        originalName: item.name,
        originalDescription: item.description,
        originalPrice: item.price,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })

  const insertMutation = useMutation({
    mutationFn: (values: AddProductFormValues) =>
      insertProduct({ data: { ...values, price: Number(values.price) } }),
    onSuccess: (inserted, values) => {
      const price = Number(inserted.price)
      table.options.meta?.updateRow(row.index, {
        productId: inserted.id,
        name: values.name,
        description: values.description,
        category: values.category,
        price,
        originalName: values.name,
        originalDescription: values.description,
        originalPrice: price,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      setDialogOpen(false)
    },
  })

  const needsRemoveConfirm =
    item.specialKey != null && TOGGLE_DRIVEN_SPECIAL_KEYS.has(item.specialKey)

  const handleRemoveClick = () => {
    if (needsRemoveConfirm) {
      setConfirmRemoveOpen(true)
      return
    }
    if (item.specialKey && table.options.meta?.removeSpecial) {
      table.options.meta.removeSpecial(item.specialKey)
      return
    }
    table.options.meta?.removeRow(row.index)
  }

  const handleConfirmRemove = () => {
    if (item.specialKey && table.options.meta?.removeSpecial) {
      table.options.meta.removeSpecial(item.specialKey)
    } else {
      table.options.meta?.removeRow(row.index)
    }
    setConfirmRemoveOpen(false)
  }

  const removeWarningCopy =
    item.specialKey === 'kort'
      ? 'Dette fjerner fullstendig kort fra denne ordren, om du har lagt inn korttekst vil dette bli slettet. Om du kun vil utelate kostnaden, endre prisen til 0 kr istedenfor.'
      : item.specialKey === 'leveringstid'
        ? 'Dette fjerner leveringstiden fra denne ordren. Om du kun vil utelate kostnaden, endre prisen til 0 kr istedenfor.'
        : ''

  return (
    <div className="flex justify-end gap-1">
      {canSaveExisting ? (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!isDirty || updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
          aria-label="Lagre endringer"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      ) : null}
      {isNew ? (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={item.name.trim() === '' || insertMutation.isPending}
            onClick={() => setDialogOpen(true)}
            aria-label="Lagre ny vare"
          >
            {insertMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-sm note:bg-secondary">
              <DialogHeader>
                <DialogTitle>Lagre vare</DialogTitle>
                <DialogDescription>
                  Bekreft detaljene og legg til en kategori.
                </DialogDescription>
              </DialogHeader>
              <AddProductForm
                saveText="Lagre"
                close
                disabled={insertMutation.isPending}
                defaultValues={{
                  name: item.name,
                  description: item.description,
                  price: String(item.price),
                  category: item.category ?? '',
                }}
                onSubmit={async (values) => {
                  await insertMutation.mutateAsync(values)
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : null}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={updateMutation.isPending || insertMutation.isPending}
        onClick={handleRemoveClick}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Fjern rad</span>
      </Button>
      {needsRemoveConfirm ? (
        <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fjern {item.name}?</DialogTitle>
              <DialogDescription>{removeWarningCopy}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Avbryt</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleConfirmRemove}>
                Fjern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
