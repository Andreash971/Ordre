import { Empty, EmptyContent } from '@/components/ui/empty'

interface EmptyCardProps extends React.PropsWithChildren {
  className?: string
  componentName: string
}

function EmptyCard({ className, componentName }: EmptyCardProps) {
  return (
    <Empty className={`border border-dashed ${className}`}>
      <EmptyContent>
        Inkluder {componentName} i ordren for å endre.
      </EmptyContent>
    </Empty>
  )
}

export { EmptyCard }
