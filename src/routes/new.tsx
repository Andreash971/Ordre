import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import OrderSection from '@/components/OrderSection'
import { CustomerFormCard } from '@/components/CustomerForm'
import { Empty, EmptyDescription } from '@/components/ui/empty'
import OrderItems from '@/components/new-order/OrderItems'
import SharedDetails from '@/components/new-order/SharedDetails'
import RecipientList from '@/components/new-order/RecipientList'
import OrderProof from '@/components/new-order/OrderProof'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { pickCustomerFormValues } from '@/lib/order-utils'
import { useSaveCustomerMutation } from '@/hooks/use-save-customer-mutation'
import type { CustomerFormValues } from '@/lib/order-utils'
import type { CustomerSelection } from '@shared/customers'
import { resolveCustomerTypeDefault } from '@shared/settings'
import { useSettings } from '@/lib/store-hooks'
import { isSpecial } from '@/lib/special-items'
import {
  initOrderDraft,
  orderDraftReducer,
} from '@/components/new-order/order-draft'

function isSenderFilled(s: CustomerFormValues) {
  return Boolean(s.name || s.phone || s.address || s.company)
}

export const Route = createFileRoute('/new')({ component: NewOrderPage })

function NewOrderPage() {
  const settings = useSettings()
  const autoSaveCustomer = settings.autoSaveCustomer
  const saveCustomerMutation = useSaveCustomerMutation()

  const recipientDefaultType = resolveCustomerTypeDefault(
    settings,
    'recipientForm',
  )

  const [draft, dispatch] = React.useReducer(
    orderDraftReducer,
    {
      specialItems: settings.specialItems,
      senderType: resolveCustomerTypeDefault(settings, 'senderForm'),
    },
    initOrderDraft,
  )

  const [saveErrorMessage, setSaveErrorMessage] = React.useState<string | null>(
    null,
  )
  const saveErrorResolveRef = React.useRef<((proceed: boolean) => void) | null>(
    null,
  )

  function resolveSaveError(proceed: boolean) {
    const resolve = saveErrorResolveRef.current
    saveErrorResolveRef.current = null
    setSaveErrorMessage(null)
    resolve?.(proceed)
  }

  const beforeSubmit = React.useCallback(async (): Promise<boolean> => {
    if (!autoSaveCustomer) return true

    const targets: Array<{
      values: CustomerFormValues
      selection: CustomerSelection
    }> = []
    if (isSenderFilled(draft.sender)) {
      targets.push({ values: draft.sender, selection: draft.senderSelection })
    }
    for (const r of draft.recipients) {
      const values = pickCustomerFormValues(r)
      if (isSenderFilled(values)) {
        targets.push({ values, selection: r.selection })
      }
    }

    for (const target of targets) {
      try {
        await saveCustomerMutation.mutateAsync(target)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ukjent feil ved lagring.'
        return new Promise<boolean>((resolve) => {
          saveErrorResolveRef.current = resolve
          setSaveErrorMessage(message)
        })
      }
    }
    return true
  }, [
    autoSaveCustomer,
    draft.sender,
    draft.senderSelection,
    draft.recipients,
    saveCustomerMutation,
  ])

  const senderFilled = isSenderFilled(draft.sender)
  const recipientCount = draft.recipients.length || (senderFilled ? 1 : 0)
  const canShowReview = senderFilled && draft.items.some((i) => !isSpecial(i))

  return (
    <main className="rise-in page-wrap flex flex-col gap-10 px-4 pb-12 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Ny ordre
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Fyll ut kunde og varer, sett leveringsdetaljer, og legg til
          mottakerne.
        </p>
      </header>

      <div className="grid gap-x-6 gap-y-8 lg:grid-cols-[17rem_1fr]">
        <OrderSection title="Kundeinformasjon" subtitle="Avsender / betaler">
          <CustomerFormCard
            showSaveButton={!autoSaveCustomer}
            defaultValues={draft.sender}
            defaultSelection={draft.senderSelection}
            onValuesChange={(values) => dispatch({ type: 'setSender', values })}
            onSelectionChange={(selection) =>
              dispatch({ type: 'setSenderSelection', selection })
            }
            onSubmit={(values, { selection }) =>
              saveCustomerMutation.mutateAsync({ values, selection })
            }
          />
        </OrderSection>

        <OrderSection
          title="Ordreinnhold"
          subtitle="Legg til varer i ordren"
          bodyClassName="flex min-h-0 flex-1 flex-col"
        >
          <OrderItems
            items={draft.items}
            setItems={(updater) => dispatch({ type: 'updateItems', updater })}
            onSpecialPicked={(key) =>
              dispatch({
                type: 'specialPicked',
                key,
                specialItems: settings.specialItems,
              })
            }
            onSpecialRemoved={(key) =>
              dispatch({ type: 'specialRemoved', key })
            }
          />
        </OrderSection>
      </div>

      <OrderSection
        title="Leveringsdetaljer & kort"
        subtitle="Standard informasjon for hele ordren. Gjelder alle mottakere og kan overstyres per mottaker."
      >
        <SharedDetails draft={draft} dispatch={dispatch} />
      </OrderSection>

      <OrderSection
        title="Mottakere"
        subtitle={
          recipientCount
            ? `${recipientCount} mottaker${recipientCount === 1 ? '' : 'e'}`
            : 'Leveres til kundens standardadresse'
        }
      >
        <RecipientList
          draft={draft}
          dispatch={dispatch}
          autoSaveCustomer={autoSaveCustomer}
          defaultCustomerType={recipientDefaultType}
        />
      </OrderSection>

      {canShowReview ? (
        <OrderSection
          title="Kontroller & generer"
          subtitle="Siste sjekk før utskrift"
        >
          <OrderProof draft={draft} beforeSubmit={beforeSubmit} />
        </OrderSection>
      ) : (
        <Empty className="border border-dashed rise-in">
          <EmptyDescription>
            Velg en kunde og legg til minst én vare for å se ordrens oversikt.
          </EmptyDescription>
        </Empty>
      )}

      <Dialog
        open={saveErrorMessage !== null}
        onOpenChange={(open) => {
          if (!open) resolveSaveError(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunne ikke lagre kundeinformasjon</DialogTitle>
            <DialogDescription>
              {saveErrorMessage}
              {'\n'}Vil du fortsette med ordren likevel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => resolveSaveError(false)}>
              Avbryt
            </Button>
            <Button onClick={() => resolveSaveError(true)}>
              Fortsett uten å lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
