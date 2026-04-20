import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'

import { Field, FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface AutocompleteFieldProps<T extends { id: number }> {
  field: {
    name: string
    state: {
      value: string
      meta: {
        isTouched: boolean
        isValid: boolean
        errors: Array<{ message?: string } | undefined>
      }
    }
    handleChange: (value: string) => void
    handleBlur: () => void
  }
  id: string
  icon: React.ReactNode
  placeholder: string
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete']
  onSearch: (query: string) => Promise<T[]>
  onSelect: (item: T) => void
  renderSuggestion: (item: T) => React.ReactNode
}

export default function AutocompleteField<T extends { id: number }>({
  field,
  id,
  icon,
  placeholder,
  type = 'text',
  disabled,
  autoComplete = 'off',
  onSearch,
  onSelect,
  renderSuggestion,
}: AutocompleteFieldProps<T>) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [menuRect, setMenuRect] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(field.state.value), 300)
    return () => clearTimeout(timer)
  }, [field.state.value])

  const { data: suggestions = [] } = useQuery({
    queryKey: [field.name, debouncedValue],
    queryFn: () => onSearch(debouncedValue),
    enabled: debouncedValue.length >= 1,
    staleTime: 1000 * 10,
  })

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return
    const el = listRef.current.children[highlightedIndex] as
      | HTMLElement
      | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex])

  useLayoutEffect(() => {
    if (!showSuggestions) return
    const update = () => {
      const el = inputRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setMenuRect({ top: r.bottom, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [showSuggestions])

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} data-disabled>
      <div className="relative">
        <InputGroup>
          <InputGroupAddon>{icon}</InputGroupAddon>
          <InputGroupInput
            id={id}
            name={field.name}
            type={type}
            ref={inputRef}
            value={field.state.value}
            disabled={disabled}
            onChange={(e) => {
              field.handleChange(e.target.value)
              setHighlightedIndex(-1)
              if (e.target.value.length >= 1) {
                setShowSuggestions(true)
              } else {
                setShowSuggestions(false)
              }
            }}
            onBlur={() => {
              field.handleBlur()
              setTimeout(() => {
                setShowSuggestions(false)
                setHighlightedIndex(-1)
              }, 150)
            }}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setHighlightedIndex((i) => (i + 1) % suggestions.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setHighlightedIndex((i) =>
                  i <= 0 ? suggestions.length - 1 : i - 1,
                )
              } else if (e.key === 'Enter') {
                if (highlightedIndex >= 0) {
                  e.preventDefault()
                  onSelect(suggestions[highlightedIndex])
                  setShowSuggestions(false)
                  setHighlightedIndex(-1)
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false)
                setHighlightedIndex(-1)
              }
            }}
            aria-invalid={isInvalid}
            placeholder={placeholder}
            autoComplete={autoComplete}
            role="combobox"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `${id}-option-${highlightedIndex}`
                : undefined
            }
          />
        </InputGroup>
        {showSuggestions &&
          suggestions.length > 0 &&
          menuRect &&
          createPortal(
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              className="fixed z-50 mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto"
              style={{
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
              }}
            >
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground',
                    index === highlightedIndex &&
                      'bg-accent text-accent-foreground',
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={() => {
                    onSelect(item)
                    setShowSuggestions(false)
                    setHighlightedIndex(-1)
                  }}
                >
                  {renderSuggestion(item)}
                </li>
              ))}
            </ul>,
            document.body,
          )}
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
