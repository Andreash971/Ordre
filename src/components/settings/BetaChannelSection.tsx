import { FlaskConical } from 'lucide-react'

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

export default function BetaChannelSection() {
  const enabled = useSettings().betaChannel
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <FlaskConical />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Betaversjoner</ItemTitle>
        <ItemDescription>
          Motta varsler om kommende beta-oppdateringer før de er offisielt
          utgitt.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          checked={enabled}
          onCheckedChange={(next) => updateSettings({ betaChannel: next })}
        />
      </ItemActions>
    </Item>
  )
}
