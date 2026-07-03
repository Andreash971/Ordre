import { Clock } from 'lucide-react'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { TimePicker } from '@/components/ui/time-picker'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

function DeliveryTimePresetsForm() {
  const presets = useSettings().deliveryTimePresets

  function handleChange(index: number, value: string) {
    const next = [...presets] as [string, string, string, string]
    next[index] = value
    updateSettings({ deliveryTimePresets: next })
  }

  return (
    <div className="flex gap-2 w-full pt-1">
      {presets.map((value, i) => (
        <TimePicker
          key={i}
          value={value}
          onChange={(v) => {
            if (v !== null) handleChange(i, v)
          }}
          className="flex-1"
        />
      ))}
    </div>
  )
}

export default function DeliveryTimeSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Clock />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Leveringstidspunkter</ItemTitle>
        <ItemDescription>
          Hurtigvalg for leveringstid ved ny ordre.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <DeliveryTimePresetsForm />
      </ItemFooter>
    </Item>
  )
}
