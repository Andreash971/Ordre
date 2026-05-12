import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
  placeholder?: string
  className?: string
  triggerClassName?: string
}

export default function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = 'Velg kategori',
  className,
  triggerClassName,
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.toLowerCase().includes(q))
  }, [query, categories])

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal note:border-border gray:bg-white/70',
              !value && 'text-muted-foreground',
              triggerClassName,
            )}
          >
            {value || placeholder}
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <div className="p-2 border-b">
            <InputGroup className="gray:border-transparent note:border-border">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Søk kategori"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </InputGroup>
          </div>
          <div className="max-h-60 overflow-auto py-1">
            {matches.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Ingen treff
              </div>
            ) : (
              matches.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground',
                    c === value && 'text-primary',
                  )}
                  onClick={() => {
                    onChange(c)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <span>{c}</span>
                  {c === value ? <Check className="size-4" /> : null}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
