import * as React from 'react'

import { DataTable } from '@/components/ui/DataTable'
import ProductPicker from '#/components/ProductPicker'
import type { PickedProduct } from '#/components/ProductPicker'
import { columns as orderColumns } from '#/components/OrderColumns'
import type { Item } from '#/components/OrderColumns'

interface SectionItemsProps {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
}

const SPECIAL_ITEMS = new Set(['Frakt', 'Frakt Tidspunktstillegg', 'Kort'])

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

export default function SectionItems({ items, setItems }: SectionItemsProps) {
  const handlePick = (p: PickedProduct) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.name === p.name)
      if (existingIndex !== -1) {
        return prev.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      const newItem: Item = { name: p.name, price: p.price, quantity: 1 }
      const firstSpecialIndex = prev.findIndex((i) =>
        SPECIAL_ITEMS.has(i.name),
      )
      if (firstSpecialIndex === -1) return [...prev, newItem]
      return [
        ...prev.slice(0, firstSpecialIndex),
        newItem,
        ...prev.slice(firstSpecialIndex),
      ]
    })
  }

  const grandTotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className="flex flex-col gap-4">
      <ProductPicker onPick={handlePick} />

      <DataTable
        columns={orderColumns}
        data={items}
        setData={setItems}
        rowClassName={(row) =>
          SPECIAL_ITEMS.has(row.original.name) ? 'bg-accent/10' : undefined
        }
        emptyMessage="Ingen varer lagt til enda."
      />

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
        <span className="text-sm font-medium">Totalt</span>
        <div className="font-mono text-base font-medium">
          {nokFormatter.format(grandTotal)}
        </div>
      </div>
    </div>
  )
}
