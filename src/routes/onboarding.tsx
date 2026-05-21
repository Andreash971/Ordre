import { useState } from 'react'
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

import type { CompanyInfo } from '@/lib/settings'
import { completeOnboarding, updateSettings } from '@/lib/settings'

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
    updateSettings({ company: trimmed })
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
                <h3 className="text-sm font-medium">Visningsnavn</h3>
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

            <section className="flex flex-col gap-3 mb-8">
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
