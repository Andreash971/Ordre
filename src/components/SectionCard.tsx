import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  number: string
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export default function SectionCard({
  number,
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('rise-in note:ring-border', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 pb-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 shrink-0 rounded border border-input bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {number}
          </span>
          <div className="flex flex-col min-w-0">
            <h2 className="font-heading text-base font-medium leading-snug">
              {title}
            </h2>
            {subtitle ? (
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        ) : null}
      </div>
      <CardContent className={cn('pt-1', bodyClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
