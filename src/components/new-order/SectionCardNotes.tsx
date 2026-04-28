import * as React from 'react'
import { MessageSquarePlus, StickyNote, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyButton } from '@/components/ui/empty-button'

interface SectionCardNotesProps {
  cardEnabled: boolean
  cardValue: string
  onCardEnabledChange: (enabled: boolean) => void
  onCardValueChange: (value: string) => void

  instructionsEnabled: boolean
  instructionsValue: string
  onInstructionsEnabledChange: (enabled: boolean) => void
  onInstructionsValueChange: (value: string) => void
}

const CARD_SIGNATURES = [
  'Med vennlig hilsen',
  'Kjærlig hilsen',
  'Klem fra',
  'Hjertelig gratulerer',
  'Hilsen',
]

const INSTRUCTION_SUGGESTIONS = [
  'Ring før ankomst',
  'Sett på trappen hvis ingen åpner',
  'Levér til nabo ved fravær',
  'Bruk bakinngangen',
]

function appendSignature(current: string, signature: string) {
  const trimmed = current.trimEnd()
  if (!trimmed) return signature
  const sep = trimmed.endsWith('\n\n') ? '' : '\n\n'
  return `${trimmed}${sep}${signature}`
}

function appendSuggestion(current: string, suggestion: string) {
  const trimmed = current.trimEnd()
  if (!trimmed) return suggestion
  const sep = trimmed.endsWith('\n') ? '' : '\n'
  return `${trimmed}${sep}${suggestion}`
}

export default function SectionCardNotes({
  cardEnabled,
  cardValue,
  onCardEnabledChange,
  onCardValueChange,
  instructionsEnabled,
  instructionsValue,
  onInstructionsEnabledChange,
  onInstructionsValueChange,
}: SectionCardNotesProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Kort */}
      {!cardEnabled ? (
        <EmptyButton
          icon={<MessageSquarePlus />}
          title="Legg til kort"
          description="Inkluder kort som skal følge med leveringen."
          onClick={() => onCardEnabledChange(true)}
          className="min-h-32"
        />
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Korttekst
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                onCardEnabledChange(false)
                onCardValueChange('')
              }}
              aria-label="Fjern kortmelding"
            >
              <X />
            </Button>
          </div>
          <Textarea
            placeholder="Skriv korttekst her…"
            value={cardValue}
            onChange={(e) => onCardValueChange(e.target.value)}
            className="min-h-32 resize-none"
          />
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Forslag
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CARD_SIGNATURES.map((sig) => (
                <Button
                  key={sig}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCardValueChange(appendSignature(cardValue, sig))
                  }
                >
                  {sig}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instruksjoner */}
      {!instructionsEnabled ? (
        <EmptyButton
          icon={<StickyNote />}
          title="Legg til spesielle instrukser"
          description="Inkluder merknader som skal følge med ordren."
          onClick={() => onInstructionsEnabledChange(true)}
          className="min-h-32"
        />
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Spesielle instrukser
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                onInstructionsEnabledChange(false)
                onInstructionsValueChange('')
              }}
              aria-label="Fjern instrukser"
            >
              <X />
            </Button>
          </div>
          <Textarea
            placeholder="Skriv instrukser her…"
            value={instructionsValue}
            onChange={(e) => onInstructionsValueChange(e.target.value)}
            className="min-h-32 resize-none"
          />
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Forslag
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSTRUCTION_SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onInstructionsValueChange(
                      appendSuggestion(instructionsValue, s),
                    )
                  }
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
