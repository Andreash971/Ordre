import * as React from 'react'
import { Check, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'

const tones = {
  warning: 'bg-warning/15 text-warning-foreground',
  success: 'bg-primary/10 text-primary',
} as const

/**
 * Inline status banner (order review, form completeness). Children render
 * as actions on the right-hand side.
 */
export function NoticeBanner({
  tone,
  title,
  description,
  children,
  className,
}: {
  tone: keyof typeof tones
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  const Icon = tone === 'warning' ? TriangleAlert : Check
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg p-3',
        tones[tone],
        className,
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {description ? (
          <div className="text-xs opacity-90">{description}</div>
        ) : null}
      </div>
      {children ? <div className="flex gap-2">{children}</div> : null}
    </div>
  )
}
