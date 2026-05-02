import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

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
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '#/lib/order-utils'

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
  const [sender, setSender] = React.useState<CustomerFormValues>(EMPTY_SENDER)
  const [delivery, setDelivery] = React.useState<DeliveryValues>({
    date: getLocalDateString(),
    time: null,
  })
  const [showTime, setShowTime] = React.useState(false)

  const [cardEnabled, setCardEnabled] = React.useState(false)
  const [cardValue, setCardValue] = React.useState('')
  const [instructionsEnabled, setInstructionsEnabled] = React.useState(false)
  const [instructionsValue, setInstructionsValue] = React.useState('')

  const [items, setItems] = React.useState<Item[]>([
    { name: 'Frakt', description: '', price: 100, quantity: 1 },
  ])
  const [recipients, setRecipients] = React.useState<Customer[]>([])

  // Sync extras rows with toggles
  React.useEffect(() => {
    setItems((prev) =>
      showTime
        ? prev.some((i) => i.name === 'Frakt Tidspunktstillegg')
          ? prev
          : [
              ...prev,
              {
                name: 'Frakt Tidspunktstillegg',
                description: '',
                price: 100,
                quantity: 1,
              },
            ]
        : prev.filter((i) => i.name !== 'Frakt Tidspunktstillegg'),
    )
  }, [showTime])

  React.useEffect(() => {
    setItems((prev) =>
      cardEnabled
        ? prev.some((i) => i.name === 'Kort')
          ? prev
          : [
              ...prev,
              { name: 'Kort', description: '', price: 25, quantity: 1 },
            ]
        : prev.filter((i) => i.name !== 'Kort'),
    )
  }, [cardEnabled])

  const senderFilled = isSenderFilled(sender)
  const recipientCount = recipients.length || (senderFilled ? 1 : 0)
  const canShowReview =
    senderFilled &&
    items.some(
      (i) => !['Frakt', 'Frakt Tidspunktstillegg', 'Kort'].includes(i.name),
    )

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
          <SectionItems items={items} setItems={setItems} />
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
