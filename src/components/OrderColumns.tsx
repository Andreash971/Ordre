'use client'
import { useState } from 'react'
import * as z from 'zod'
import type { ColumnDef, Row, RowData, Table } from '@tanstack/react-table'

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: keyof Item, value: number) => void
    removeRow: (rowIndex: number) => void
  }
}

const itemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
})

export type Item = z.infer<typeof itemSchema>

function QuantityCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const [isEditing, setIsEditing] = useState(false)
  const quantity = row.original.quantity

  if (!isEditing) {
    return (
      <div
        className="flex justify-end cursor-default select-none"
        onDoubleClick={() => setIsEditing(true)}
      >
        {quantity}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end">
      <Input
        type="number"
        min={1}
        value={quantity}
        autoFocus
        onChange={(e) =>
          table.options.meta?.updateData(
            row.index,
            'quantity',
            Math.max(1, Number(e.target.value)),
          )
        }
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
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
})

function PriceCell({ row, table }: { row: Row<Item>; table: Table<Item> }) {
  const [isEditing, setIsEditing] = useState(false)
  const price = row.original.price

  if (!isEditing) {
    return (
      <div
        className="flex justify-end cursor-default select-none"
        onDoubleClick={() => setIsEditing(true)}
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
        autoFocus
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
      }).format(row.original.price * row.original.quantity)

      return <div className="text-right">{formatted}</div>
    },
  },
  {
    id: 'action',
    header: () => <div className="text-right"></div>,
    cell: ({ row, table }) => {
      return (
        <div className="text-right">
          <button onClick={() => table.options.meta?.removeRow(row.index)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
  },
]
