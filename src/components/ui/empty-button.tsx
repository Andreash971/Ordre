import * as React from 'react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

interface EmptyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
}

export function EmptyButton({
  icon,
  title,
  description,
  className,
  ...props
}: EmptyButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'group flex w-full flex-1 cursor-pointer rounded-xl text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <Empty className="border border-dashed group-hover:border-primary group-hover:bg-accent/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description ? (
            <EmptyDescription>{description}</EmptyDescription>
          ) : null}
        </EmptyHeader>
      </Empty>
    </button>
  )
}

export default EmptyButton
