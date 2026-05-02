import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { PackagePlus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { searchProducts } from '#/components/OrderProductsContent'
import { queryKeys } from '#/lib/query-keys'
import { cn } from '@/lib/utils'

export type PickedProduct = {
  id?: number
  name: string
  price: number
  category: string
  description: string
}

interface ProductPickerProps {
  onPick: (product: PickedProduct) => void
  onAddNew: () => void
  placeholder?: string
  addButtonLabel?: string
  className?: string
}

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

export default function ProductPicker({
  onPick,
  onAddNew,
  placeholder = 'Søk etter vare…',
  addButtonLabel = 'Ny vare',
  className,
}: ProductPickerProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.products.search(debouncedQuery),
    queryFn: () => searchProducts({ data: debouncedQuery }),
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 10,
  })

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            autoComplete="off"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(e.target.value.length >= 1)
            }}
            onFocus={() => setShowSuggestions(searchQuery.length >= 1)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150)
            }}
          />
        </InputGroup>
        {showSuggestions && suggestions.length > 0 ? (
          <ul className="absolute z-20 w-full mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
            {suggestions.map((p) => (
              <li
                key={p.id}
                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  onPick({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    category: p.category ?? 'Ukategorisert',
                    description: p.description ?? '',
                  })
                  setSearchQuery('')
                  setShowSuggestions(false)
                }}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  {p.category ? (
                    <div className="text-xs">{p.category}</div>
                  ) : null}
                </div>
                <div className="font-mono text-sm shrink-0">
                  {nokFormatter.format(Number(p.price))}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button type="button" variant="default" onClick={onAddNew}>
        <PackagePlus />
        <span className="hidden sm:inline">{addButtonLabel}</span>
      </Button>
    </div>
  )
}
