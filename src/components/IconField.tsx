import * as React from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

function MissingTag() {
  return (
    <span className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-warning-foreground">
      <span className="size-1.5 rounded-full bg-warning" />
      Mangler
    </span>
  )
}

/**
 * Controlled input with a leading icon; the non-form-library counterpart to
 * FormInputField. Set `missing` to flag the field with warning styling and
 * a "Mangler" tag.
 */
export function IconInputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  missing,
  mono,
  type = 'text',
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  missing?: boolean
  mono?: boolean
  type?: React.HTMLInputTypeAttribute
}) {
  return (
    <InputGroup
      className={
        missing
          ? 'border-warning bg-warning/10 has-[input:focus-visible]:border-warning has-[input:focus-visible]:ring-warning/20'
          : 'bg-card'
      }
    >
      <InputGroupAddon>{icon}</InputGroupAddon>
      <InputGroupInput
        type={type}
        value={value}
        aria-label={label}
        placeholder={placeholder ?? label}
        onChange={(e) => onChange(e.target.value)}
        className={mono ? 'font-mono' : undefined}
      />
      {missing ? (
        <InputGroupAddon align="inline-end">
          <MissingTag />
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

/** Read-only sibling of IconInputField, for values that cannot be edited. */
export function IconReadField({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      aria-label={label}
      className="flex h-9 items-center gap-2 rounded-lg border bg-muted/40 px-2.5 text-sm text-muted-foreground"
    >
      <span className="[&>svg]:size-4">{icon}</span>
      <span className="truncate text-foreground">{children}</span>
    </div>
  )
}
