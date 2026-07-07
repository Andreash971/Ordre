import { Badge } from '@/components/ui/badge'

/**
 * Warning badge for order fields that block printing, e.g. "Mangler telefon"
 * or "Mangler 2 felt" when several are missing.
 */
export function MissingFieldsBadge({ fields }: { fields: string[] }) {
  if (fields.length === 0) return null
  return (
    <Badge className="border-transparent bg-warning/15 font-mono text-[10px] uppercase tracking-wider text-warning-foreground">
      {fields.length > 1
        ? `Mangler ${fields.length} felt`
        : `Mangler ${fields[0]}`}
    </Badge>
  )
}
