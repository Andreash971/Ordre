import { Palette } from 'lucide-react'

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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ThemeMode } from '@/lib/theme'
import { THEMES, setTheme } from '@/lib/theme'
import { useTheme } from '@/lib/store-hooks'

function SelectTheme() {
  const mode = useTheme()

  function handleChange(value: string) {
    setTheme(value as ThemeMode)
  }

  // Group options: ungrouped first, then grouped
  const ungrouped = THEMES.filter((o) => o.group === null)
  const groups = [
    ...new Set(
      THEMES.filter((o) => o.group !== null).map((o) => o.group as string),
    ),
  ]

  return (
    <Select value={mode} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ungrouped.length > 0 && (
          <SelectGroup>
            {ungrouped.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {groups.map((group, i) => {
          const options = THEMES.filter((o) => o.group === group)
          return (
            <SelectGroup key={group}>
              {(ungrouped.length > 0 || i > 0) && <SelectSeparator />}
              <SelectLabel>{group}</SelectLabel>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default function ThemeSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Palette />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Tema</ItemTitle>
        <ItemDescription>Velg et tema.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <SelectTheme />
      </ItemActions>
    </Item>
  )
}
