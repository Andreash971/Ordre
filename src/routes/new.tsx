import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import SectionCard from '#/components/SectionCard'
import CustomerForm from '#/components/CustomerForm'
import { Empty, EmptyDescription } from '@/components/ui/empty'
import SectionItems from '#/components/new-order/SectionItems'
import SectionDelivery from '#/components/new-order/SectionDelivery'
import SectionCardNotes from '#/components/new-order/SectionCardNotes'
import SectionRecipients from '#/components/new-order/SectionRecipients'
import SectionReview from '#/components/new-order/SectionReview'
import type { Item } from '#/components/OrderColumns'
import { Separator } from '@/components/ui/separator'
import { getLocalDateString } from '#/lib/order-utils'
import { insertCustomer, updateCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '#/lib/order-utils'
import { getStoredSettings } from '#/lib/settings'
import type { SpecialItemKey } from '#/lib/settings'
import { isSpecial } from '#/lib/special-items'

const EMPTY_SENDER: CustomerFormValues = {
  name: '',
  phone: '',
  company: '',
  address: '',
  postcode: '',
  city: '',
  careof: '',
}

function isSenderFilled(s: CustomerFormValues) {
  return Boolean(s.name || s.phone || s.address)
}

export const Route = createFileRoute('/new')({ component: NewOrderPage })

function NewOrderPage() {
  const queryClient = useQueryClient()
  const [sender, setSender] = React.useState<CustomerFormValues>(EMPTY_SENDER)
  const saveCustomerMutation = useMutation({
    mutationFn: async ({
      values,
      id,
    }: {
      values: CustomerFormValues
      id: number | null
    }) => {
      if (id != null) {
        await updateCustomer({ data: { id, ...values } })
      } else {
        await insertCustomer({ data: values })
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })
  const [delivery, setDelivery] = React.useState<DeliveryValues>({
    date: getLocalDateString(),
    time: null,
  })
  const [showTime, setShowTime] = React.useState(false)

  const [cardEnabled, setCardEnabled] = React.useState(false)
  const [cardValue, setCardValue] = React.useState('')
  const [instructionsEnabled, setInstructionsEnabled] = React.useState(false)
  const [instructionsValue, setInstructionsValue] = React.useState('')

  const [items, setItems] = React.useState<Item[]>(() => {
    const { frakt } = getStoredSettings().specialItems
    return [
      {
        specialKey: 'frakt',
        name: frakt.name,
        description: '',
        price: frakt.price,
        quantity: 1,
      },
    ]
  })
  const [recipients, setRecipients] = React.useState<Customer[]>([])

  // Sync extras rows with toggles
  React.useEffect(() => {
    setItems((prev) => {
      if (showTime) {
        if (prev.some((i) => i.specialKey === 'leveringstid')) {
          return prev
        }
        const { leveringstid } = getStoredSettings().specialItems
        return [
          ...prev,
          {
            specialKey: 'leveringstid',
            name: leveringstid.name,
            description: '',
            price: leveringstid.price,
            quantity: 1,
          },
        ]
      }
      return prev.filter((i) => i.specialKey !== 'leveringstid')
    })
  }, [showTime])

  React.useEffect(() => {
    setItems((prev) => {
      if (cardEnabled) {
        if (prev.some((i) => i.specialKey === 'kort')) return prev
        const { kort } = getStoredSettings().specialItems
        return [
          ...prev,
          {
            specialKey: 'kort',
            name: kort.name,
            description: '',
            price: kort.price,
            quantity: 1,
          },
        ]
      }
      return prev.filter((i) => i.specialKey !== 'kort')
    })
  }, [cardEnabled])

  const handleSpecialPicked = React.useCallback((key: SpecialItemKey) => {
    if (key === 'leveringstid') setShowTime(true)
    if (key === 'kort') setCardEnabled(true)
  }, [])

  const handleSpecialRemoved = React.useCallback((key: SpecialItemKey) => {
    if (key === 'leveringstid') {
      setShowTime(false)
      return
    }
    if (key === 'kort') {
      setCardEnabled(false)
      return
    }
    setItems((prev) => prev.filter((i) => i.specialKey !== key))
  }, [])

  const senderFilled = isSenderFilled(sender)
  const recipientCount = recipients.length || (senderFilled ? 1 : 0)
  const canShowReview = senderFilled && items.some((i) => !isSpecial(i))

  return (
    <main className="rise-in page-wrap flex flex-col gap-6 px-4 pb-12 pt-6">
      <h1 className="font-heading text-2xl font-medium leading-tight">
        Registrer ny bestilling
      </h1>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:grid-rows-[auto_auto] items-start lg:items-stretch">
        <SectionCard
          className="col-start-1"
          number="01"
          title="Kunde"
          subtitle="Hvem er avsender / betaler?"
        >
          <CustomerForm
            bare
            formButtons
            showCareof
            defaultValues={sender}
            onValuesChange={setSender}
            onSubmit={(values, { id }) =>
              saveCustomerMutation.mutateAsync({ values, id })
            }
          />
        </SectionCard>

        <SectionCard
          className="col-start-1 row-start-2"
          number="02"
          title="Levering"
          subtitle="Velg leveringsdato og tidspunkt"
        >
          <SectionDelivery
            date={delivery.date}
            time={delivery.time}
            showTime={showTime}
            onDateChange={(d) => setDelivery((prev) => ({ ...prev, date: d }))}
            onTimeChange={(t) => setDelivery((prev) => ({ ...prev, time: t }))}
            onShowTimeChange={setShowTime}
          />
        </SectionCard>

        <SectionCard
          className="col-start-2 row-start-1 row-span-2"
          bodyClassName="lg:flex lg:flex-1 lg:min-h-0 lg:flex-col"
          number="03"
          title="Ordreinnhold"
          subtitle="Legg til varer i ordren"
        >
          <SectionItems
            items={items}
            setItems={setItems}
            onSpecialPicked={handleSpecialPicked}
            onSpecialRemoved={handleSpecialRemoved}
          />
        </SectionCard>
      </div>

      <SectionCard
        number="04"
        title="Kort og instrukser"
        subtitle="Inkluder og behandle kort og instrukser"
      >
        <SectionCardNotes
          cardEnabled={cardEnabled}
          cardValue={cardValue}
          onCardEnabledChange={setCardEnabled}
          onCardValueChange={setCardValue}
          instructionsEnabled={instructionsEnabled}
          instructionsValue={instructionsValue}
          onInstructionsEnabledChange={setInstructionsEnabled}
          onInstructionsValueChange={setInstructionsValue}
        />
      </SectionCard>

      <SectionCard
        number="05"
        title="Mottakere"
        subtitle={
          recipientCount
            ? `${recipientCount} mottaker${recipientCount === 1 ? '' : 'e'}`
            : 'Leveres til kundens standardadresse'
        }
      >
        <SectionRecipients
          recipients={recipients}
          onRecipientsChange={setRecipients}
          defaults={{
            delivery,
            showTime,
            cardEnabled,
            cardValue,
            instructionsEnabled,
            instructionsValue,
          }}
        />
      </SectionCard>

      {canShowReview ? <Separator /> : null}

      {canShowReview ? (
        <SectionCard
          number="06"
          title="Oversikt"
          subtitle="Gjennomgå og generer ordrelapp(er)"
        >
          <SectionReview
            sender={sender}
            delivery={delivery}
            items={items}
            recipients={recipients}
            cardEnabled={cardEnabled}
            cardValue={cardValue}
            instructionsEnabled={instructionsEnabled}
            instructionsValue={instructionsValue}
          />
        </SectionCard>
      ) : (
        <Empty className="border border-dashed rise-in">
          <EmptyDescription>
            Velg en kunde og legg til minst én vare for å se ordrens oversikt.
          </EmptyDescription>
        </Empty>
      )}
    </main>
  )
}
