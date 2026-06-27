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
import type { Item } from '#/components/OrderColumns'
import { queryKeys } from '#/lib/query-keys'
import { getStoredSettings } from '#/lib/settings'
import type { SpecialItemKey } from '#/lib/settings'
import { SPECIAL_ITEM_KEYS } from '#/lib/special-items'
import { cn } from '@/lib/utils'

export type PickedProduct = {
  id?: number
  specialKey?: SpecialItemKey
  name: string
  price: number
  category: string
  description: string
}

interface ProductPickerProps {
  onPick: (product: PickedProduct) => void
  onAddNew: () => void
  currentItems?: Item[]
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
  currentItems,
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

  const specialSuggestions = React.useMemo(() => {
    if (debouncedQuery.length < 1) return []
    const specialItems = getStoredSettings().specialItems
    const presentKeys = new Set(
      (currentItems ?? [])
        .map((i) => i.specialKey)
        .filter((k): k is SpecialItemKey => k != null),
    )
    const lower = debouncedQuery.toLowerCase()
    return SPECIAL_ITEM_KEYS.filter((key) => !presentKeys.has(key))
      .map((key) => ({ key, ...specialItems[key] }))
      .filter((s) => s.name.toLowerCase().includes(lower))
  }, [debouncedQuery, currentItems])

  const hasAnySuggestion =
    suggestions.length > 0 || specialSuggestions.length > 0

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <InputGroup className="bg-card">
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
        {showSuggestions && hasAnySuggestion ? (
          <ul className="absolute z-20 w-full mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
            {suggestions.map((p) => (
              <li
                key={`p-${p.id}`}
                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  onPick({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    category: p.category,
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
            {specialSuggestions.map((s) => (
              <li
                key={`s-${s.key}`}
                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  onPick({
                    specialKey: s.key,
                    name: s.name,
                    price: s.price,
                    category: '',
                    description: '',
                  })
                  setSearchQuery('')
                  setShowSuggestions(false)
                }}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-medium truncate">{s.name}</span>
                  <span className="inline-flex items-center rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Tillegg
                  </span>
                </div>
                <div className="font-mono text-sm shrink-0">
                  {nokFormatter.format(s.price)}
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
