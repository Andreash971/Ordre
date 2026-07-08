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
import { cn } from '@/lib/utils'

import CompanyStep, {
  COMPANY_FIELD_LABELS,
} from '@/components/onboarding/CompanyStep'
import type {
  CompanyFieldKey,
  CompanyFormState,
} from '@/components/onboarding/CompanyStep'
import ModulesStep from '@/components/onboarding/ModulesStep'
import PrinterStep from '@/components/onboarding/PrinterStep'
import { completeOnboarding, updateSettings } from '@/lib/settings'
import { DEFAULT_MODULES } from '@shared/modules'
import type { ModulesSettings } from '@shared/modules'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

const STEPS = [
  {
    id: 'company',
    title: 'Bedrift',
    description:
      'Fyll inn bedriftens informasjon for å komme i gang. Du kan endre dette senere under Innstillinger.',
  },
  {
    id: 'modules',
    title: 'Moduler',
    description: 'Velg hvilke deler av appen bedriften skal bruke.',
  },
  {
    id: 'printer',
    title: 'Skriver',
    description: 'Sett opp utskrift av ordre. Dette steget er valgfritt.',
  },
] as const

type StepId = (typeof STEPS)[number]['id']

const EMPTY_FORM: CompanyFormState = {
  name: '',
  displayName: '',
  address: '',
  postCode: '',
  phone: '',
}

const UNTOUCHED: Record<CompanyFieldKey, boolean> = {
  name: false,
  displayName: false,
  address: false,
  postCode: false,
  phone: false,
}

const ALL_TOUCHED: Record<CompanyFieldKey, boolean> = {
  name: true,
  displayName: true,
  address: true,
  postCode: true,
  phone: true,
}

function OnboardingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM)
  const [touched, setTouched] =
    useState<Record<CompanyFieldKey, boolean>>(UNTOUCHED)
  const [modules, setModules] = useState<ModulesSettings>(DEFAULT_MODULES)
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const step: StepId = STEPS[stepIndex].id
  const isLastStep = stepIndex === STEPS.length - 1

  const trimmed: CompanyFormState = {
    name: form.name.trim(),
    displayName: form.displayName.trim(),
    address: form.address.trim(),
    postCode: form.postCode.trim(),
    phone: form.phone.trim(),
  }

  const errors: Partial<Record<CompanyFieldKey, string>> = {}
  ;(Object.keys(trimmed) as Array<CompanyFieldKey>).forEach((key) => {
    if (!trimmed[key]) errors[key] = `${COMPANY_FIELD_LABELS[key]} er påkrevd`
  })
  const companyValid = Object.keys(errors).length === 0

  function handleChange(field: CompanyFieldKey, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field: CompanyFieldKey) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleNext(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step === 'company') {
      setTouched(ALL_TOUCHED)
      if (!companyValid) return
    }
    if (!isLastStep) {
      setStepIndex((i) => i + 1)
      return
    }
    if (submitting) return
    setSubmitting(true)
    updateSettings({
      company: trimmed,
      defaultPrinter: selectedPrinter,
      modules,
    })
    completeOnboarding()
    void navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-xl dark:bg-card">
        <CardHeader>
          <div className="flex items-baseline justify-between gap-4">
            <CardTitle className="font-heading text-2xl">Oppsett</CardTitle>
            <span className="text-xs text-muted-foreground">
              Steg {stepIndex + 1} av {STEPS.length}: {STEPS[stepIndex].title}
            </span>
          </div>
          <div
            className="flex gap-1.5 pt-1"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={stepIndex + 1}
            aria-label="Fremdrift i oppsettet"
          >
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= stepIndex ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
          <CardDescription className="pt-1">
            {STEPS[stepIndex].description}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleNext} noValidate>
          <CardContent className="pb-8">
            {step === 'company' && (
              <CompanyStep
                form={form}
                touched={touched}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {step === 'modules' && (
              <ModulesStep
                modules={modules}
                onModuleChange={(id, enabled) =>
                  setModules((prev) => ({ ...prev, [id]: enabled }))
                }
              />
            )}
            {step === 'printer' && (
              <PrinterStep
                selectedPrinter={selectedPrinter}
                onSelect={setSelectedPrinter}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStepIndex((i) => i - 1)}
                disabled={submitting}
              >
                Tilbake
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={submitting}>
              {isLastStep ? 'Kom i gang' : 'Neste'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
