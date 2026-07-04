import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { version } from '../../package.json'

import ThemeSection from '@/components/settings/ThemeSection'
import QuickSelectSection from '@/components/settings/QuickSelectSection'
import DeliveryTimeSection from '@/components/settings/DeliveryTimeSection'
import AutoSaveSection from '@/components/settings/AutoSaveSection'
import CustomerTypeSection from '@/components/settings/CustomerTypeSection'
import SpecialItemsSection from '@/components/settings/SpecialItemsSection'
import PrinterSection from '@/components/settings/PrinterSection'
import CompanySection from '@/components/settings/CompanySection'
import RowsPerPageSection from '@/components/settings/RowsPerPageSection'
import RetentionSection from '@/components/settings/RetentionSection'
import BetaChannelSection from '@/components/settings/BetaChannelSection'
import BringApiSection from '@/components/settings/BringApiSection'
import ClearArchiveSection from '@/components/settings/ClearArchiveSection'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  return (
    <main className="rise-in page-wrap px-4 pb-8 pt-6">
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <ThemeSection />
        <QuickSelectSection />
        <DeliveryTimeSection />
        <AutoSaveSection />
        <CustomerTypeSection />
        <SpecialItemsSection />
        <PrinterSection />
        <CompanySection />
        <RowsPerPageSection />
        <RetentionSection />

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
              className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                <strong>Kun for avanserte brukere.</strong> Endring av disse
                innstillingene kan påvirke appens funksjonalitet. Ikke endre noe
                her med mindre du vet hva du gjør.
              </p>
            </div>

            <BetaChannelSection />
            <BringApiSection />
            <ClearArchiveSection />
          </div>
        )}
      </div>
      <footer className="mt-6 text-sm text-muted-foreground">
        © Andreas Henriksen · v{version}
      </footer>
    </main>
  )
}
