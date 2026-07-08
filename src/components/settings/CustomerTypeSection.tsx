import { Users } from 'lucide-react'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CustomerType } from '@shared/customers'
import type { CustomerTypeLocation } from '@shared/settings'
import { updateSettings } from '@/lib/settings'
import { useEnabledCustomerTypes, useSettings } from '@/lib/store-hooks'

const LOCATION_LABELS: Record<CustomerTypeLocation, string> = {
  senderForm: 'Kundeinformasjon (ny ordre)',
  recipientForm: 'Mottakere (ny ordre)',
  customersPage: 'Kunderegister',
}

function CustomerTypeSelect({
  value,
  onChange,
  disabled,
}: {
  value: CustomerType
  onChange: (next: CustomerType) => void
  disabled?: boolean
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as CustomerType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="private">Privat</SelectItem>
          <SelectItem value="business">Firma</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function CustomerTypeSection() {
  const defaults = useSettings().customerTypeDefaults
  const enabledTypes = useEnabledCustomerTypes()

  // With a single customer-type module enabled there is nothing to default
  // between — the Moduler section is where that is controlled.
  if (enabledTypes.length < 2) return null

  function setGlobal(next: CustomerType) {
    updateSettings({ customerTypeDefaults: { global: next } })
  }

  function setPerLocation(enabled: boolean) {
    updateSettings({
      customerTypeDefaults: {
        perLocation: enabled,
        // Seed each location with the current global default so enabling the
        // switch changes nothing until a location is actually overridden.
        ...(enabled && {
          locations: {
            senderForm: defaults.global,
            recipientForm: defaults.global,
            customersPage: defaults.global,
          },
        }),
      },
    })
  }

  function setLocation(location: CustomerTypeLocation, next: CustomerType) {
    updateSettings({
      customerTypeDefaults: { locations: { [location]: next } },
    })
  }

  return (
    <Item variant="outline" className="bg-card flex-col items-stretch">
      <div className="flex w-full items-center gap-4">
        <ItemMedia variant="icon">
          <Users />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Standard kundetype</ItemTitle>
          <ItemDescription>
            Hvilken kundetype (Privat/Firma) som er valgt som standard i
            kundeskjemaer og kunderegisteret.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <CustomerTypeSelect
            value={defaults.global}
            onChange={setGlobal}
            disabled={defaults.perLocation}
          />
        </ItemActions>
      </div>

      <div className="flex w-full items-center justify-between gap-4 border-t pt-3">
        <div className="text-sm text-muted-foreground">
          Egne standarder per sted i appen
        </div>
        <Switch
          checked={defaults.perLocation}
          onCheckedChange={setPerLocation}
        />
      </div>

      {defaults.perLocation && (
        <div className="flex w-full flex-col gap-2">
          {(Object.keys(LOCATION_LABELS) as CustomerTypeLocation[]).map(
            (location) => (
              <div
                key={location}
                className="flex items-center justify-between gap-4"
              >
                <div className="text-sm">{LOCATION_LABELS[location]}</div>
                <CustomerTypeSelect
                  value={defaults.locations[location]}
                  onChange={(next) => setLocation(location, next)}
                />
              </div>
            ),
          )}
        </div>
      )}
    </Item>
  )
}
