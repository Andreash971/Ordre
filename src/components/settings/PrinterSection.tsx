import { useEffect, useState } from 'react'
import { AlertTriangle, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
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
import type { DiscoveredPrinter, PrinterInfo } from '@shared/printing'
import { updateSettings } from '@/lib/settings'
import { useSettings } from '@/lib/store-hooks'

function PrinterSettings() {
  const [printers, setPrinters] = useState<
    Array<PrinterInfo | DiscoveredPrinter>
  >([])
  const defaultPrinter = useSettings().defaultPrinter
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleRefresh()
  }, [])

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    try {
      const list = await window.electronAPI.printer.list()
      setPrinters(list)
    } catch (e) {
      setError(
        `Kunne ikke hente skrivere: ${e instanceof Error ? e.message : String(e)}`,
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDiscover() {
    setDiscovering(true)
    setError(null)
    try {
      const found = await window.electronAPI.printer.discover()
      setPrinters((prev) => {
        const existing = new Set(prev.map((p) => p.name))
        return [...prev, ...found.filter((p) => !existing.has(p.name))]
      })
    } catch (e) {
      setError(
        `Kunne ikke søke etter skrivere: ${e instanceof Error ? e.message : String(e)}`,
      )
    } finally {
      setDiscovering(false)
    }
  }

  function handleSelect(name: string) {
    updateSettings({ defaultPrinter: name === '__none__' ? null : name })
  }

  return (
    <div className="flex flex-col gap-3 w-full min-w-0 pt-1">
      <div className="flex gap-2 min-w-0 w-full">
        <Select
          value={defaultPrinter ?? '__none__'}
          onValueChange={handleSelect}
        >
          <SelectTrigger className="!w-0 flex-1 min-w-0 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate *:data-[slot=select-value]:min-w-0">
            <SelectValue placeholder="Ingen skriver valgt" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__none__">Ingen (deaktivert)</SelectItem>
              {printers.map((p) => (
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
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Laster…' : 'Oppdater'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDiscover}
          disabled={discovering}
        >
          {discovering ? 'Søker…' : 'Søk nettverk'}
        </Button>
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200 min-w-0"
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="min-w-0 break-words break-all">{error}</p>
        </div>
      )}
      {defaultPrinter && (
        <p className="text-xs text-muted-foreground">
          Standardskriver: <span className="font-medium">{defaultPrinter}</span>
        </p>
      )}
    </div>
  )
}

export default function PrinterSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Printer />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Skriver</ItemTitle>
        <ItemDescription>
          Velg standardskriver for direkte utskrift av ordre.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <PrinterSettings />
      </ItemFooter>
    </Item>
  )
}
