import { Rows3 } from 'lucide-react'

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
import type { PageSizeOption } from '@/lib/settings'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

function SelectRowsPerPage() {
  const value = useSettings().rowsPerPage

  function handleChange(v: string) {
    const next = Number(v) as PageSizeOption
    updateSettings({ rowsPerPage: next })
  }

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="14">14</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function RowsPerPageSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Rows3 />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Rader per side</ItemTitle>
        <ItemDescription>Antall rader som vises i tabeller.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <SelectRowsPerPage />
      </ItemActions>
    </Item>
  )
}
