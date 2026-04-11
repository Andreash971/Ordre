import { Button } from '@/components/ui/button'
import { Empty, EmptyContent } from '@/components/ui/empty'

interface EmptyExtraProps extends React.PropsWithChildren {
  className?: string
  extraName: string
  onClick?: () => void
  icon?: React.ReactNode
}

function EmptyExtra({ className, extraName, onClick, icon }: EmptyExtraProps) {
  return (
    <Empty className={`border border-dashed ${className}`}>
      <EmptyContent>
        <Button variant="default" size="sm" onClick={onClick}>
          {icon} Legg til {extraName}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export { EmptyExtra }
