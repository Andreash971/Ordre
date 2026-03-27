'use client'

import { useState } from 'react'
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
import { Search } from 'lucide-react'

import { db } from '#/db/'
import { productsDummy } from '#/db/schema'

interface OrderProductsContentProps extends React.PropsWithChildren {
  className: string
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

export default function OrderProductsContent({
  className,
}: OrderProductsContentProps) {
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ordreinnhold</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
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
                      return [
                        ...prev,
                        {
                          name: product.name,
                          price: Number(product.price),
                          quantity: 1,
                        },
                      ]
                    })
                    setSearchQuery('')
                    setSuggestions([])
                    setShowSuggestions(false)
                  }}
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground flex gap-1.5 mt-0.5">
                    {product.category && <span>{product.category}</span>}
                    {product.category && <span>|</span>}
                    <span>{nokFormatter.format(Number(product.price))}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <OrderTable items={items} setItems={setItems} />
      </CardContent>
    </Card>
  )
}
