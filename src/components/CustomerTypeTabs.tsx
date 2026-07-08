import { Building2, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import type { CustomerType } from '@shared/customers'

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  private: 'Privat',
  business: 'Firma',
}

const CUSTOMER_TYPE_ICONS: Record<CustomerType, React.ReactNode> = {
  private: <User />,
  business: <Building2 />,
}

interface CustomerTypeTabsProps {
  value: CustomerType
  /** The switchable types; with fewer than two the tabs render nothing. */
  types: ReadonlyArray<CustomerType>
  onChange: (type: CustomerType) => void
  disabled?: boolean
  /** Stretch the group and its buttons to the container width. */
  fullWidth?: boolean
}

/**
 * The Privat/Firma tab selector used by customer forms and the customer
 * register. Pass only the types whose module is enabled (plus the current
 * value when it comes from saved data) — a single type needs no tabs.
 */
export default function CustomerTypeTabs({
  value,
  types,
  onChange,
  disabled,
  fullWidth,
}: CustomerTypeTabsProps) {
  if (types.length < 2) return null
  return (
    <ButtonGroup className={fullWidth ? 'w-full' : undefined}>
      {types.map((type) => (
        <Button
          key={type}
          type="button"
          size="sm"
          variant={value === type ? 'default' : 'outline'}
          className={fullWidth ? 'flex-1' : undefined}
          disabled={disabled}
          onClick={() => onChange(type)}
        >
          {CUSTOMER_TYPE_ICONS[type]}
          {CUSTOMER_TYPE_LABELS[type]}
        </Button>
      ))}
    </ButtonGroup>
  )
}
