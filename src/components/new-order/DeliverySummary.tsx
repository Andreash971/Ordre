import { cn } from '@/lib/utils'
import { formatDeliveryDate } from '#/lib/order-utils'

interface DeliverySummaryProps {
  date: string
  time: string | null
  className?: string
}

export default function DeliverySummary({
  date,
  time,
  className,
}: DeliverySummaryProps) {
  const formatted = date ? formatDeliveryDate(date) : null

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted/30 p-3 text-sm flex flex-col gap-0.5',
        className,
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Valgt levering
      </div>
      {formatted ? (
        <>
          <div className="font-medium">
            {formatted.dayText}, {formatted.longDate}
          </div>
          <div className="text-muted-foreground font-mono">
            {time ? `kl. ${time}` : 'Ingen tid valgt'}
          </div>
        </>
      ) : (
        <div className="text-muted-foreground">Ingen dato valgt.</div>
      )}
    </div>
  )
}
