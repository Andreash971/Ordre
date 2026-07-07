import * as React from 'react'
import { ChevronRight } from 'lucide-react'

/**
 * Dashboard key-figure card. Pass `onClick` to make the card an action:
 * it gets a chevron affordance and warning-tinted hover styling.
 */
export function KpiCard({
  label,
  value,
  unit,
  warn,
  onClick,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  warn?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      {onClick ? (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-md bg-warning/15 text-warning-foreground transition group-hover:translate-x-0.5 group-hover:bg-warning group-hover:text-background">
          <ChevronRight className="size-4" />
        </span>
      ) : null}
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {warn ? (
          <span className="inline-block size-1.5 rounded-full bg-warning" />
        ) : null}
        {label}
      </div>
      <div className="mt-2 font-heading text-2xl font-semibold leading-none">
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative rounded-lg border bg-card p-4 text-left transition hover:border-warning hover:ring-3 hover:ring-warning/20"
      >
        {content}
      </button>
    )
  }
  return <div className="rounded-lg border bg-card p-4">{content}</div>
}
