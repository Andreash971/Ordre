import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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
  DialogDescription,
} from '@/components/ui/dialog'

import AddProductForm from '#/components/AddProductForm'
import type { AddProductFormValues } from '#/components/AddProductForm'
import { insertProduct, searchProducts } from '#/lib/product-server-fns'
import { queryKeys } from '#/lib/query-keys'
import { useOrderForm } from '#/components/order-form/OrderFormContext'
import { getStoredSettings } from '#/lib/settings'
import { isSpecial } from '#/lib/special-items'

export { searchProducts }

interface OrderProductsContentProps extends React.PropsWithChildren {
  className: string
  onItemsChange?: (items: Item[]) => void
}

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
})

export default function OrderProductsContent({
  className,
  onItemsChange,
}: OrderProductsContentProps) {
  const { showTime, showCardText } = useOrderForm()
  const [items, setItems] = useState<Item[]>(() => {
    const { frakt } = getStoredSettings().specialItems
    return [
      {
        specialKey: 'frakt',
        name: frakt.name,
        description: '',
        price: frakt.price,
        quantity: 1,
      },
    ]
  })

  useEffect(() => {
    setItems((prev) => {
      if (showTime) {
        if (prev.some((i) => i.specialKey === 'leveringstid')) {
          return prev
        }
        const { leveringstid } = getStoredSettings().specialItems
        return [
          ...prev,
          {
            specialKey: 'leveringstid',
            name: leveringstid.name,
            description: '',
            price: leveringstid.price,
            quantity: 1,
          },
        ]
      }
      return prev.filter((i) => i.specialKey !== 'leveringstid')
    })
  }, [showTime])

  useEffect(() => {
    setItems((prev) => {
      if (showCardText) {
        if (prev.some((i) => i.specialKey === 'kort')) return prev
        const { kort } = getStoredSettings().specialItems
        return [
          ...prev,
          {
            specialKey: 'kort',
            name: kort.name,
            description: '',
            price: kort.price,
            quantity: 1,
          },
        ]
      }
      return prev.filter((i) => i.specialKey !== 'kort')
    })
  }, [showCardText])
  useEffect(() => {
    onItemsChange?.(items)
  }, [items, onItemsChange])

  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.products.search(debouncedQuery),
    queryFn: () => searchProducts({ data: debouncedQuery }),
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 10,
  })

  const addProductMutation = useMutation({
    mutationFn: (values: AddProductFormValues) =>
      insertProduct({ data: { ...values, price: Number(values.price) } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })

  async function handleAddProduct(values: AddProductFormValues) {
    const newRow = await addProductMutation.mutateAsync(values)
    const price = Number(newRow.price)
    const newItem: Item = {
      productId: newRow.id,
      name: values.name,
      description: values.description,
      category: values.category,
      price,
      quantity: 1,
      originalName: values.name,
      originalDescription: values.description,
      originalPrice: price,
    }
    setItems((prev) => {
      const firstSpecialIndex = prev.findIndex((i) => isSpecial(i))
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
      <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex gap-2 mb-0">
          <div className="relative flex-1">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="product-search"
                name="product-search"
                placeholder="Søk etter vare..."
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  setShowSuggestions(value.length >= 1)
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
                          (item) =>
                            item.specialKey == null &&
                            item.name === product.name,
                        )
                        if (existingIndex !== -1) {
                          return prev.map((item, i) =>
                            i === existingIndex
                              ? { ...item, quantity: item.quantity + 1 }
                              : item,
                          )
                        }
                        const price = Number(product.price)
                        const description = product.description ?? ''
                        const newItem: Item = {
                          productId: product.id,
                          name: product.name,
                          description,
                          category: product.category,
                          price,
                          quantity: 1,
                          originalName: product.name,
                          originalDescription: description,
                          originalPrice: price,
                        }
                        const firstSpecialIndex = prev.findIndex((i) =>
                          isSpecial(i),
                        )
                        if (firstSpecialIndex === -1) return [...prev, newItem]
                        return [
                          ...prev.slice(0, firstSpecialIndex),
                          newItem,
                          ...prev.slice(firstSpecialIndex),
                        ]
                      })
                      setSearchQuery('')
                      setShowSuggestions(false)
                    }}
                  >
                    <span className="font-medium">{product.name}</span>
                    {product.description ? (
                      <span className="text-xs text-muted-foreground block truncate">
                        {product.description}
                      </span>
                    ) : null}
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
            <span className="hidden sm:inline">Ny vare</span>
          </Button>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Legg til vare</DialogTitle>
              <DialogDescription>
                Fyll inn navn, kategori og pris.
              </DialogDescription>
            </DialogHeader>
            <AddProductForm
              saveText="Legg til"
              close
              onSubmit={handleAddProduct}
            />
          </DialogContent>
        </Dialog>

        <OrderTable
          items={items}
          setItems={setItems}
          className="flex-1 min-h-96"
        />
      </CardContent>
    </Card>
  )
}
