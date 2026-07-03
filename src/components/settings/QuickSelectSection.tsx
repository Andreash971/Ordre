import { useState } from 'react'
import { X, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { QuickSelectSettings } from '@/lib/settings'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

function QuickSelectList({
  items,
  onAdd,
  onRemove,
}: {
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}) {
  const [draft, setDraft] = useState('')

  function handleAdd() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Fjern "${item}"`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Legg til forslag…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          Legg til
        </Button>
      </div>
    </div>
  )
}

function QuickSelectForm() {
  const quickSelect = useSettings().quickSelect

  function update(next: QuickSelectSettings) {
    updateSettings({ quickSelect: next })
  }

  function addSignature(value: string) {
    update({
      ...quickSelect,
      cardSignatures: [...quickSelect.cardSignatures, value],
    })
  }

  function removeSignature(index: number) {
    update({
      ...quickSelect,
      cardSignatures: quickSelect.cardSignatures.filter((_, i) => i !== index),
    })
  }

  function addSuggestion(value: string) {
    update({
      ...quickSelect,
      instructionSuggestions: [...quickSelect.instructionSuggestions, value],
    })
  }

  function removeSuggestion(index: number) {
    update({
      ...quickSelect,
      instructionSuggestions: quickSelect.instructionSuggestions.filter(
        (_, i) => i !== index,
      ),
    })
  }

  return (
    <div className="grid gap-4 w-full pt-1">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Kort
        </div>
        <QuickSelectList
          items={quickSelect.cardSignatures}
          onAdd={addSignature}
          onRemove={removeSignature}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Instrukser
        </div>
        <QuickSelectList
          items={quickSelect.instructionSuggestions}
          onAdd={addSuggestion}
          onRemove={removeSuggestion}
        />
      </div>
    </div>
  )
}

export default function QuickSelectSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Zap />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Hurtigvalg</ItemTitle>
        <ItemDescription>
          Forslagsknapper som vises under Kort og Instrukser ved ny ordre.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <QuickSelectForm />
      </ItemFooter>
    </Item>
  )
}
