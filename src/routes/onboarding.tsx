import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { CompanyInfo } from '@/lib/settings'
import { completeOnboarding, updateSettings } from '@/lib/settings'
import type { DiscoveredPrinter, Printer as PrinterInfo } from '@/lib/electron'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

type FormState = CompanyInfo

const EMPTY_FORM: FormState = {
  name: '',
  displayName: '',
  address: '',
  postCode: '',
  phone: '',
}

const FIELD_LABELS: Record<keyof FormState, string> = {
  name: 'Juridisk navn',
  displayName: 'Visningsnavn',
  address: 'Adresse',
  postCode: 'Postnummer og sted',
  phone: 'Telefon',
}

function OnboardingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    displayName: false,
    address: false,
    postCode: false,
    phone: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [printers, setPrinters] = useState<
    Array<PrinterInfo | DiscoveredPrinter>
  >([])
  const [printersLoading, setPrintersLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)

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

  const trimmed: FormState = {
    name: form.name.trim(),
    displayName: form.displayName.trim(),
    address: form.address.trim(),
    postCode: form.postCode.trim(),
    phone: form.phone.trim(),
  }

  const errors: Partial<Record<keyof FormState, string>> = {}
  ;(Object.keys(trimmed) as (keyof FormState)[]).forEach((key) => {
    if (!trimmed[key]) errors[key] = `${FIELD_LABELS[key]} er påkrevd`
  })
  const isValid = Object.keys(errors).length === 0

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field: keyof FormState) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({
      name: true,
      displayName: true,
      address: true,
      postCode: true,
      phone: true,
    })
    if (!isValid || submitting) return
    setSubmitting(true)
    updateSettings({ company: trimmed, defaultPrinter: selectedPrinter })
    completeOnboarding()
    void navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-xl dark:bg-card gray:bg-card">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Oppsett</CardTitle>
          <CardDescription>
            Fyll inn bedriftens informasjon for å komme i gang. Du kan endre
            dette senere under Innstillinger.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-medium">Tittelinformasjon</h3>
                <p className="text-xs text-muted-foreground">
                  Vises i sidemenyen og øverst på utskrifter. Vanligvis det
                  korte merkenavnet uten selskapsform.
                </p>
              </div>
              <Field
                id="onboarding-displayName"
                label={FIELD_LABELS.displayName}
                placeholder="F.eks. Mitt Firma"
                autoComplete="organization"
                value={form.displayName}
                onChange={(v) => handleChange('displayName', v)}
                onBlur={() => handleBlur('displayName')}
                error={touched.displayName ? errors.displayName : undefined}
              />
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-medium">Bedriftsinformasjon</h3>
                <p className="text-xs text-muted-foreground">
                  Brukes i adressefeltet på ordredokumenter (kjørelapper).
                </p>
              </div>
              <Field
                id="onboarding-name"
                label={FIELD_LABELS.name}
                placeholder="F.eks. Mitt Firma AS"
                autoComplete="organization"
                value={form.name}
                onChange={(v) => handleChange('name', v)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : undefined}
              />
              <Field
                id="onboarding-address"
                label={FIELD_LABELS.address}
                placeholder="Gateadresse"
                autoComplete="street-address"
                value={form.address}
                onChange={(v) => handleChange('address', v)}
                onBlur={() => handleBlur('address')}
                error={touched.address ? errors.address : undefined}
              />
              <Field
                id="onboarding-postCode"
                label={FIELD_LABELS.postCode}
                placeholder="0000 Sted"
                autoComplete="postal-code"
                value={form.postCode}
                onChange={(v) => handleChange('postCode', v)}
                onBlur={() => handleBlur('postCode')}
                error={touched.postCode ? errors.postCode : undefined}
              />
              <Field
                id="onboarding-phone"
                label={FIELD_LABELS.phone}
                placeholder="Telefonnummer"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(v) => handleChange('phone', v)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
              />
            </section>

            <Separator />

            <section className="flex flex-col gap-3 mb-8">
              <div>
                <h3 className="text-sm font-medium">Skriver (valgfritt)</h3>
                <p className="text-xs text-muted-foreground">
                  Velg en standardskriver for direkte utskrift av ordre.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={selectedPrinter ?? '__none__'}
                  onValueChange={(v) =>
                    setSelectedPrinter(v === '__none__' ? null : v)
                  }
                >
                  <SelectTrigger className="flex-1 gray:border-border gray:bg-input">
                    <SelectValue placeholder="Ingen skriver valgt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__none__">
                        Ingen (deaktivert)
                      </SelectItem>
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
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              Kom i gang
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}

type FieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: React.HTMLInputTypeAttribute
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete']
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  autoComplete,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className="gray:border-border gray:bg-input"
      />
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
