'use client'

import { useEffect, useState } from 'react'
import { ilike } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'

import OrderTable from './OrderTable'
import type { Item } from './OrderColumns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { PackagePlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { db } from '#/db/'
import { productsDummy } from '#/db/schema'
import AddProductForm, {
  type AddProductFormValues,
} from '#/components/AddProductForm'
import { insertProduct } from '#/lib/product-server-fns'

interface OrderProductsContentProps extends React.PropsWithChildren {
  className: string
  showTime: boolean
  showCardText: boolean
  selectedCustomerTime?: string | null
  onItemsChange?: (items: Item[]) => void
}

export const searchProducts = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 1) return []
    return db
      .select({
        id: productsDummy.id,
        name: productsDummy.name,
        category: productsDummy.category,
        price: productsDummy.price,
      })
      .from(productsDummy)
      .where(ilike(productsDummy.name, `%${query}%`))
      .limit(3)
  })

type ProductSuggestion = Awaited<ReturnType<typeof searchProducts>>[number]

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
})

const SPECIAL_ITEMS = new Set(['Frakt', 'Frakt Tidspunktstillegg', 'Kort'])

export default function OrderProductsContent({
  className,
  showTime,
  showCardText,
  selectedCustomerTime,
  onItemsChange,
}: OrderProductsContentProps) {
  const [items, setItems] = useState<Item[]>([
    { name: 'Frakt', price: 100, quantity: 1 },
  ])

  useEffect(() => {
    const showTimeItem = showTime && selectedCustomerTime !== null
    setItems((prev) =>
      showTimeItem
        ? prev.some((i) => i.name === 'Frakt Tidspunktstillegg')
          ? prev
          : [
              ...prev,
              { name: 'Frakt Tidspunktstillegg', price: 100, quantity: 1 },
            ]
        : prev.filter((i) => i.name !== 'Frakt Tidspunktstillegg'),
    )
  }, [showTime, selectedCustomerTime])

  useEffect(() => {
    setItems((prev) =>
      showCardText
        ? prev.some((i) => i.name === 'Kort')
          ? prev
          : [...prev, { name: 'Kort', price: 25, quantity: 1 }]
        : prev.filter((i) => i.name !== 'Kort'),
    )
  }, [showCardText])
  useEffect(() => {
    onItemsChange?.(items)
  }, [items, onItemsChange])

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  async function handleAddProduct(values: AddProductFormValues) {
    const newRow = await insertProduct({
      data: { ...values, price: Number(values.price) },
    })
    const newItem = {
      name: values.name,
      price: Number(newRow.price),
      quantity: 1,
    }
    setItems((prev) => {
      const firstSpecialIndex = prev.findIndex((i) => SPECIAL_ITEMS.has(i.name))
      if (firstSpecialIndex === -1) return [...prev, newItem]
      return [
        ...prev.slice(0, firstSpecialIndex),
        newItem,
        ...prev.slice(firstSpecialIndex),
      ]
    })
    setAddOpen(false)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ordreinnhold</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex gap-2 mb-0">
          <div className="relative flex-1">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Søk etter produkt..."
                autoComplete="off"
                value={searchQuery}
                onChange={async (e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  if (value.length >= 1) {
                    const results = await searchProducts({ data: value })
                    setSuggestions(results)
                    setShowSuggestions(true)
                  } else {
                    setSuggestions([])
                    setShowSuggestions(false)
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150)
                }}
              />
            </InputGroup>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
                {suggestions.map((product) => (
                  <li
                    key={product.id}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={() => {
                      setItems((prev) => {
                        const existingIndex = prev.findIndex(
                          (item) => item.name === product.name,
                        )
                        if (existingIndex !== -1) {
                          return prev.map((item, i) =>
                            i === existingIndex
                              ? { ...item, quantity: item.quantity + 1 }
                              : item,
                          )
                        }
                        const newItem = {
                          name: product.name,
                          price: Number(product.price),
                          quantity: 1,
                        }
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
                      setSearchQuery('')
                      setSuggestions([])
                      setShowSuggestions(false)
                    }}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs flex gap-1.5 mt-0.5">
                      {product.category && <span>{product.category}</span>}
                      {product.category && <span>|</span>}
                      <span>{nokFormatter.format(Number(product.price))}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button type="button" onClick={() => setAddOpen(true)}>
            <PackagePlus />
            Nytt produkt
          </Button>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Legg til produkt</DialogTitle>
            </DialogHeader>
            <AddProductForm
              saveText="Legg til"
              close
              onSubmit={handleAddProduct}
            />
          </DialogContent>
        </Dialog>

        <OrderTable items={items} setItems={setItems} className="flex-1" />
      </CardContent>
    </Card>
  )
}
