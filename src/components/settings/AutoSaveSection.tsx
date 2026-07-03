import { Save } from 'lucide-react'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Switch } from '@/components/ui/switch'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

export default function AutoSaveSection() {
  const enabled = useSettings().autoSaveCustomer
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Save />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Lagre kunde automatisk</ItemTitle>
        <ItemDescription>
          Skru på for å alltid lagre/oppdatere kundeinformasjon automatisk når
          en ordre sendes til utskrift/PDF.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          checked={enabled}
          onCheckedChange={(next) => updateSettings({ autoSaveCustomer: next })}
        />
      </ItemActions>
    </Item>
  )
}
