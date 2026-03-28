import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import CustomerForm from '../components/CustomerForm'
import TimeDateForm from '../components/TimeDateForm'
import OrderProductsContent from '#/components/OrderProductsContent'
import OrderExtraInfo from '#/components/OrderExtraInfo'
import OrderReceiverInfo from '#/components/OrderReceiverInfo'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [showCardText, setShowCardText] = useState(false)
  const [cardTextValue, setCardTextValue] = useState('')
  const [showInstructionsText, setShowInstructionsText] = useState(false)
  const [instructionsTextValue, setInstructionsTextValue] = useState('')

  return (
    <main className="page-wrap grid grid-cols-[2fr_4fr] grid-rows-[auto_auto_auto_auto] gap-4 px-4 pb-8 pt-6">
      <CustomerForm
        formButtons={true}
        saveText="Lagre Kunde"
        className="col-start-1 row-start-1 rise-in"
      />
      <OrderProductsContent className="col-start-2 row-start-1 row-span-2 rise-in" />
      <TimeDateForm className="col-start-1 row-start-2 rise-in" />
      <OrderExtraInfo
        className="col-start-1 row-start-3 col-span-2 rise-in"
        showCardText={showCardText}
        onCardTextChange={setShowCardText}
        cardTextValue={cardTextValue}
        onCardTextValueChange={setCardTextValue}
        showInstructionsText={showInstructionsText}
        onInstructionsChange={setShowInstructionsText}
        instructionsTextValue={instructionsTextValue}
        onInstructionsTextValueChange={setInstructionsTextValue}
      />
      <OrderReceiverInfo
        className="col-start-1 row-start-4 col-span-2 rise-in"
        showCardText={showCardText}
        showInstructionsText={showInstructionsText}
        defaultCardText={cardTextValue}
        defaultInstructionsText={instructionsTextValue}
      />
    </main>
  )
}
