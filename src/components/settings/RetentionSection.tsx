import { Clock } from 'lucide-react'

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
import type { RetentionOption } from '@/lib/settings'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

function SelectRetention() {
  const value = useSettings().archiveRetention

  function handleChange(v: string) {
    const next = (v === 'never' ? 'never' : Number(v)) as RetentionOption
    updateSettings({ archiveRetention: next })
  }

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="3">3 dager</SelectItem>
          <SelectItem value="7">7 dager</SelectItem>
          <SelectItem value="14">14 dager</SelectItem>
          <SelectItem value="30">30 dager</SelectItem>
          <SelectItem value="never">Aldri (Ikke anbefalt)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function RetentionSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Clock />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Oppbevaringstid for arkiv</ItemTitle>
        <ItemDescription>
          Velg hvor lenge ordre lagres i arkivet.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <SelectRetention />
      </ItemActions>
    </Item>
  )
}
