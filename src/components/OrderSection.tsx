import * as React from 'react'

import { cn } from '@/lib/utils'

interface OrderSectionProps {
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export default function OrderSection({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: OrderSectionProps) {
  return (
    <section className={cn('rise-in flex flex-col', className)}>
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-heading text-[1.0625rem] font-semibold leading-snug tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <div className="text-[0.8125rem] text-muted-foreground">
              {subtitle}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  )
}
