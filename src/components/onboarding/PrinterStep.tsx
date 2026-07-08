import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DiscoveredPrinter, PrinterInfo } from '@shared/printing'

interface PrinterStepProps {
  selectedPrinter: string | null
  onSelect: (printer: string | null) => void
}

/** Onboarding step 3: pick an optional default printer. */
export default function PrinterStep({
  selectedPrinter,
  onSelect,
}: PrinterStepProps) {
  const [printers, setPrinters] = useState<
    Array<PrinterInfo | DiscoveredPrinter>
  >([])
  const [printersLoading, setPrintersLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)

  useEffect(() => {
    void refreshPrinters()
  }, [])

  async function refreshPrinters() {
    setPrintersLoading(true)
    try {
      const list = await window.electronAPI.printer.list()
      setPrinters(list)
    } finally {
      setPrintersLoading(false)
    }
  }

  async function discoverPrinters() {
    setDiscovering(true)
    try {
      const found = await window.electronAPI.printer.discover()
      setPrinters((prev) => {
        const existing = new Set(prev.map((p) => p.name))
        return [...prev, ...found.filter((p) => !existing.has(p.name))]
      })
    } finally {
      setDiscovering(false)
    }
  }

  // A remembered printer (re-run with prefilled settings) stays selectable
  // even before the list loads or if it is currently unavailable.
  const options =
    selectedPrinter && !printers.some((p) => p.name === selectedPrinter)
      ? [{ name: selectedPrinter }, ...printers]
      : printers

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">Skriver (valgfritt)</h3>
        <p className="text-xs text-muted-foreground">
          Velg en standardskriver for direkte utskrift av ordre.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={selectedPrinter ?? '__none__'}
          onValueChange={(v) => onSelect(v === '__none__' ? null : v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Ingen skriver valgt" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__none__">Ingen (deaktivert)</SelectItem>
              {options.map((p) => (
                <SelectItem key={p.name} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refreshPrinters()}
          disabled={printersLoading}
        >
          {printersLoading ? 'Laster…' : 'Oppdater'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void discoverPrinters()}
          disabled={discovering}
        >
          {discovering ? 'Søker…' : 'Søk nettverk'}
        </Button>
      </div>
    </section>
  )
}
