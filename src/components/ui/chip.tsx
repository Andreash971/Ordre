import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Pill styling matching the design's `.chip` (rounded-full, soft by default,
 * solid primary when selected). Exposed as a class helper so it can dress both
 * interactive quick-picks (`Chip`) and read-only display pills (a plain span).
 */
const chipVariants = cva(
  "inline-flex h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium transition-colors outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      selected: {
        true: 'border-transparent bg-primary text-primary-foreground',
        false: 'border-border bg-background dark:bg-input/70 text-foreground',
      },
    },
    defaultVariants: { selected: false },
  },
)

/** An interactive pill quick-pick / toggle. */
function Chip({
  className,
  selected = false,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & { selected?: boolean }) {
  return (
    <button
      data-slot="chip"
      data-selected={selected || undefined}
      type={type}
      className={cn(
        chipVariants({ selected }),
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        !selected && 'hover:bg-muted',
        className,
      )}
      {...props}
    />
  )
}

export { Chip, chipVariants }
