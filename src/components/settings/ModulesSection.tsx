import { Blocks } from 'lucide-react'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import ModuleToggleList from '@/components/ModuleToggleList'
import { updateSettings } from '@/lib/settings'
import { useModules } from '@/lib/store-hooks'

export default function ModulesSection() {
  const modules = useModules()

  return (
    <Item variant="outline" className="bg-card flex-col items-stretch">
      <div className="flex w-full items-center gap-4">
        <ItemMedia variant="icon">
          <Blocks />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Moduler</ItemTitle>
          <ItemDescription>
            Hvilke deler av appen som er i bruk. Data beholdes selv om en modul
            skrus av, og vises igjen når den skrus på.
          </ItemDescription>
        </ItemContent>
      </div>
      <div className="w-full border-t pt-3">
        <ModuleToggleList
          values={modules}
          onModuleChange={(id, enabled) =>
            updateSettings({ modules: { [id]: enabled } })
          }
        />
      </div>
    </Item>
  )
}
