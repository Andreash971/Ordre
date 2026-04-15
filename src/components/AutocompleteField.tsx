import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Field, FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

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
  onSearch,
  onSelect,
  renderSuggestion,
}: AutocompleteFieldProps<T>) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState('')

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
            value={field.state.value}
            disabled={disabled}
            onChange={(e) => {
              field.handleChange(e.target.value)
              if (e.target.value.length >= 1) {
                setShowSuggestions(true)
              } else {
                setShowSuggestions(false)
              }
            }}
            onBlur={() => {
              field.handleBlur()
              setTimeout(() => setShowSuggestions(false), 150)
            }}
            aria-invalid={isInvalid}
            placeholder={placeholder}
            autoComplete="off"
          />
        </InputGroup>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
            {suggestions.map((item) => (
              <li
                key={item.id}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  onSelect(item)
                  setShowSuggestions(false)
                }}
              >
                {renderSuggestion(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
