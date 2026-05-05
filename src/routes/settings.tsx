import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

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

import { Archive, Building2, Clock, Palette, Rows3 } from 'lucide-react'

import type { ThemeMode } from '@/lib/theme'
import { THEMES, getStoredTheme, setTheme } from '@/lib/theme'
import type {
  CompanyInfo,
  PageSizeOption,
  RetentionOption,
} from '@/lib/settings'
import { getStoredSettings, updateSettings } from '@/lib/settings'
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
      />
      <Input
        id="company-address"
        name="company-address"
        autoComplete="street-address"
        value={company.address}
        placeholder="Adresse"
        onChange={(e) => handleChange('address', e.target.value)}
      />
      <Input
        id="company-postcode"
        name="company-postcode"
        autoComplete="postal-code"
        value={company.postCode}
        placeholder="Postnummer og sted"
        onChange={(e) => handleChange('postCode', e.target.value)}
      />
      <Input
        id="company-phone"
        name="company-phone"
        type="tel"
        autoComplete="tel"
        value={company.phone}
        placeholder="Telefon"
        onChange={(e) => handleChange('phone', e.target.value)}
      />
      <div className="col-span-full flex justify-end">
        <Button type="submit" variant="outline" size="sm">
          {saved ? 'Lagret' : 'Lagre'}
        </Button>
      </div>
    </form>
  )
}

function SettingsPage() {
  return (
    <main className="rise-in page-wrap px-4 pb-8 pt-6">
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <Item variant="outline" className="dark:bg-secondary">
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

        <Item variant="outline" className="dark:bg-secondary">
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

        <Item variant="outline" className="dark:bg-secondary">
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

        <Item variant="outline" className="dark:bg-secondary">
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

        <Item variant="outline" className="dark:bg-secondary">
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
      </div>
    </main>
  )
}
