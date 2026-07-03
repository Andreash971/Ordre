import { useState } from 'react'
import { PackagePlus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { SpecialItemsSettings } from '@/lib/settings'
import {
  DEFAULT_SPECIAL_ITEMS,
  getStoredSettings,
  resetSpecialItems,
  updateSettings,
} from '@/lib/settings'

function SpecialItemsForm() {
  const [items, setItems] = useState<SpecialItemsSettings>(
    () => getStoredSettings().specialItems,
  )
  const [stored, setStored] = useState<SpecialItemsSettings>(
    () => getStoredSettings().specialItems,
  )
  const [saved, setSaved] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  function handleNameChange(key: keyof SpecialItemsSettings, value: string) {
    setItems((prev) => ({ ...prev, [key]: { ...prev[key], name: value } }))
    setSaved(false)
  }

  function handlePriceChange(key: keyof SpecialItemsSettings, value: string) {
    const parsed = Number(value)
    const safe = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    setItems((prev) => ({ ...prev, [key]: { ...prev[key], price: safe } }))
    setSaved(false)
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    updateSettings({ specialItems: items })
    setStored(items)
    setSaved(true)
  }

  function handleReset() {
    resetSpecialItems()
    setItems(DEFAULT_SPECIAL_ITEMS)
    setStored(DEFAULT_SPECIAL_ITEMS)
    setSaved(true)
    setResetOpen(false)
  }

  const dirty =
    items.frakt.name !== stored.frakt.name ||
    items.frakt.price !== stored.frakt.price ||
    items.leveringstid.name !== stored.leveringstid.name ||
    items.leveringstid.price !== stored.leveringstid.price ||
    items.kort.name !== stored.kort.name ||
    items.kort.price !== stored.kort.price

  const rows: Array<{
    key: keyof SpecialItemsSettings
    label: string
  }> = [
    { key: 'frakt', label: 'Frakt' },
    { key: 'leveringstid', label: 'Leveringstid' },
    { key: 'kort', label: 'Kort' },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full pt-1">
      <div className="flex flex-col gap-3">
        {rows.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="grid grid-cols-[1fr_8rem] gap-2">
              <Input
                value={items[key].name}
                placeholder="Navn"
                onChange={(e) => handleNameChange(key, e.target.value)}
              />
              <Input
                type="number"
                min={0}
                value={items[key].price}
                placeholder="Pris"
                onChange={(e) => handlePriceChange(key, e.target.value)}
                className="text-right [appearance:textfield]"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <RotateCcw className="h-3.5 w-3.5" />
              Tilbakestill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tilbakestill standardvarer?</DialogTitle>
              <DialogDescription>
                Navn og priser for Frakt, Leveringstid og Kort vil
                tilbakestilles til standardverdiene.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Avbryt</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleReset}>
                Tilbakestill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!dirty && !saved}
        >
          {saved && !dirty ? 'Lagret' : 'Lagre'}
        </Button>
      </div>
    </form>
  )
}

export default function SpecialItemsSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <PackagePlus />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Standardvarer og tillegg</ItemTitle>
        <ItemDescription>
          Navn og standardpris for Frakt, Leveringstid og Kort.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <SpecialItemsForm />
      </ItemFooter>
    </Item>
  )
}
