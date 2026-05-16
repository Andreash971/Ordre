import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { version } from '../../package.json'

import {
  Item,
  ItemActions,
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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertTriangle,
  Archive,
  Building2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Palette,
  Printer,
  Rows3,
  Settings2,
  X,
  Zap,
} from 'lucide-react'

import type { ThemeMode } from '@/lib/theme'
import { THEMES, getStoredTheme, setTheme } from '@/lib/theme'
import type {
  BringApiCredentials,
  CompanyInfo,
  PageSizeOption,
  QuickSelectSettings,
  RetentionOption,
} from '@/lib/settings'
import { getStoredSettings, updateSettings } from '@/lib/settings'
import type { DiscoveredPrinter, Printer as PrinterInfo } from '@/lib/electron'
import { clearArchive } from '@/lib/order-utils'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SelectTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme())

  function handleChange(value: string) {
    const next = value as ThemeMode
    setMode(next)
    setTheme(next)
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
      <SelectTrigger className="w-full max-w-48 gray:border-border gray:bg-input">
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

function SelectRetention() {
  const [value, setValue] = useState<RetentionOption>(
    () => getStoredSettings().archiveRetention,
  )

  function handleChange(v: string) {
    const next = (v === 'never' ? 'never' : Number(v)) as RetentionOption
    setValue(next)
    updateSettings({ archiveRetention: next })
  }

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-48 gray:border-border gray:bg-input">
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

function ClearArchiveButton() {
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    clearArchive()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Tøm arkiv</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tøm arkiv</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil tømme arkivet? Alle lagrede ordre vil bli
            slettet permanent og kan ikke gjenopprettes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Avbryt</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Tøm arkiv
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SelectRowsPerPage() {
  const [value, setValue] = useState<PageSizeOption>(
    () => getStoredSettings().rowsPerPage,
  )

  function handleChange(v: string) {
    const next = Number(v) as PageSizeOption
    setValue(next)
    updateSettings({ rowsPerPage: next })
  }

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-48 gray:border-border gray:bg-input">
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

function CompanyInfoForm() {
  const [company, setCompany] = useState<CompanyInfo>(
    () => getStoredSettings().company,
  )
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof CompanyInfo, value: string) {
    setCompany((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    updateSettings({ company })
    setSaved(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1"
    >
      <Input
        id="company-name"
        name="company-name"
        autoComplete="organization"
        value={company.name}
        placeholder="Bedriftsnavn"
        onChange={(e) => handleChange('name', e.target.value)}
        className="gray:border-border gray:bg-input"
      />
      <Input
        id="company-address"
        name="company-address"
        autoComplete="street-address"
        value={company.address}
        placeholder="Adresse"
        onChange={(e) => handleChange('address', e.target.value)}
        className="gray:border-border gray:bg-input"
      />
      <Input
        id="company-postcode"
        name="company-postcode"
        autoComplete="postal-code"
        value={company.postCode}
        placeholder="Postnummer og sted"
        onChange={(e) => handleChange('postCode', e.target.value)}
        className="gray:border-border gray:bg-input"
      />
      <Input
        id="company-phone"
        name="company-phone"
        type="tel"
        autoComplete="tel"
        value={company.phone}
        placeholder="Telefon"
        onChange={(e) => handleChange('phone', e.target.value)}
        className="gray:border-border gray:bg-input"
      />
      <div className="col-span-full flex justify-end">
        <Button type="submit" variant="outline" size="sm">
          {saved ? 'Lagret' : 'Lagre'}
        </Button>
      </div>
    </form>
  )
}

function BringApiForm() {
  const [creds, setCreds] = useState<BringApiCredentials>(
    () => getStoredSettings().bringApi,
  )
  const [stored, setStored] = useState<BringApiCredentials>(
    () => getStoredSettings().bringApi,
  )
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof BringApiCredentials, value: string) {
    setCreds((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    updateSettings({ bringApi: creds })
    setStored(creds)
    setSaved(true)
  }

  const dirty = creds.uid !== stored.uid || creds.apiKey !== stored.apiKey

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 w-full pt-1"
    >
      <Input
        id="bring-uid"
        name="bring-uid"
        autoComplete="off"
        value={creds.uid}
        placeholder="Bring UID (e-postadresse)"
        onChange={(e) => handleChange('uid', e.target.value)}
        className="gray:border-border gray:bg-input"
      />
      <div className="relative">
        <Input
          id="bring-api-key"
          name="bring-api-key"
          type={showKey ? 'text' : 'password'}
          autoComplete="off"
          value={creds.apiKey}
          placeholder="Bring API-nøkkel"
          onChange={(e) => handleChange('apiKey', e.target.value)}
          className="gray:border-border gray:bg-input pr-9"
        />
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          aria-label={showKey ? 'Skjul API-nøkkel' : 'Vis API-nøkkel'}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Bring API brukes til postnummeroppslag og adresseforslag. Få tilgang på{' '}
        <span className="font-medium">mybring.com</span>.
      </p>
      <div className="flex justify-end">
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
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm gray:bg-input"
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
          className="gray:border-border gray:bg-input"
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
  const [quickSelect, setQuickSelect] = useState<QuickSelectSettings>(
    () => getStoredSettings().quickSelect,
  )

  function update(next: QuickSelectSettings) {
    setQuickSelect(next)
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

function PrinterSettings() {
  const [printers, setPrinters] = useState<
    Array<PrinterInfo | DiscoveredPrinter>
  >([])
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(
    () => getStoredSettings().defaultPrinter,
  )
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)

  useEffect(() => {
    handleRefresh()
  }, [])

  async function handleRefresh() {
    setLoading(true)
    try {
      const list = await window.electronAPI.printer.list()
      setPrinters(list)
    } finally {
      setLoading(false)
    }
  }

  async function handleDiscover() {
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

  function handleSelect(name: string) {
    const next = name === '__none__' ? null : name
    setDefaultPrinter(next)
    updateSettings({ defaultPrinter: next })
  }

  return (
    <div className="flex flex-col gap-3 w-full pt-1">
      <div className="flex gap-2">
        <Select
          value={defaultPrinter ?? '__none__'}
          onValueChange={handleSelect}
        >
          <SelectTrigger className="flex-1 gray:border-border gray:bg-input">
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
      {defaultPrinter && (
        <p className="text-xs text-muted-foreground">
          Standardskriver: <span className="font-medium">{defaultPrinter}</span>
        </p>
      )}
    </div>
  )
}

function SettingsPage() {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  return (
    <main className="rise-in page-wrap px-4 pb-8 pt-6">
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <Item variant="outline" className="dark:bg-card gray:bg-card">
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

        <Item variant="outline" className="dark:bg-card gray:bg-card">
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

        <Item variant="outline" className="dark:bg-card gray:bg-card">
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

        <Item variant="outline" className="dark:bg-card gray:bg-card">
          <ItemMedia variant="icon">
            <Building2 />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Bedriftsinformasjon</ItemTitle>
            <ItemDescription>
              Bedriftsinformasjonen som vises i ordredokumenter under utfører
              seksjonen.
            </ItemDescription>
          </ItemContent>
          <ItemFooter>
            <CompanyInfoForm />
          </ItemFooter>
        </Item>

        <Item variant="outline" className="dark:bg-card gray:bg-card">
          <ItemMedia variant="icon">
            <Rows3 />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Rader per side</ItemTitle>
            <ItemDescription>
              Antall rader som vises i tabeller.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <SelectRowsPerPage />
          </ItemActions>
        </Item>

        <Item variant="outline" className="dark:bg-card gray:bg-card">
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

        <Item variant="outline" className="dark:bg-card gray:bg-card">
          <ItemMedia variant="icon">
            <Archive />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Tøm arkiv</ItemTitle>
            <ItemDescription>
              Slett alle lagrede ordre permanent.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ClearArchiveButton />
          </ItemActions>
        </Item>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          aria-controls="advanced-settings-section"
          className="mt-2 flex items-center gap-2 self-start rounded-md px-2 py-1 text-base font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              advancedOpen ? 'rotate-180' : '-rotate-90'
            }`}
          />
          Avanserte innstillinger
        </button>

        {advancedOpen && (
          <div id="advanced-settings-section" className="flex flex-col gap-4">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200 note:text-amber-900"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                <strong>Kun for avanserte brukere.</strong> Endring av disse
                innstillingene kan påvirke appens funksjonalitet. Ikke endre noe
                her med mindre du vet hva du gjør.
              </p>
            </div>

            <Item variant="outline" className="dark:bg-card gray:bg-card">
              <ItemMedia variant="icon">
                <Settings2 />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Bring API</ItemTitle>
                <ItemDescription>
                  Legitimasjon for adressesøk og postnummeroppslag.
                </ItemDescription>
              </ItemContent>
              <ItemFooter>
                <BringApiForm />
              </ItemFooter>
            </Item>
          </div>
        )}
      </div>
      <footer className="mt-6 text-sm text-muted-foreground">
        © Andreas Henriksen · v{version}
      </footer>
    </main>
  )
}
