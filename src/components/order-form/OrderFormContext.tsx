import * as React from 'react'

type OrderFormContextValue = {
  showTime: boolean
  setShowTime: (value: boolean) => void

  showCardText: boolean
  setShowCardText: (value: boolean) => void
  cardTextValue: string
  setCardTextValue: (value: string) => void

  showInstructionsText: boolean
  setShowInstructionsText: (value: boolean) => void
  instructionsTextValue: string
  setInstructionsTextValue: (value: string) => void

  selectedCustomerTime: string | null | undefined
  setSelectedCustomerTime: (value: string | null | undefined) => void
}

const OrderFormContext = React.createContext<OrderFormContextValue | null>(null)

export function useOrderForm() {
  const context = React.useContext(OrderFormContext)
  if (!context) {
    throw new Error('useOrderForm must be used within an OrderFormProvider.')
  }
  return context
}

export function OrderFormProvider({ children }: { children: React.ReactNode }) {
  const [showTime, setShowTime] = React.useState(false)

  const [showCardText, setShowCardTextState] = React.useState(false)
  const [cardTextValue, setCardTextValue] = React.useState('')
  const setShowCardText = React.useCallback((value: boolean) => {
    setShowCardTextState(value)
    if (!value) setCardTextValue('')
  }, [])

  const [showInstructionsText, setShowInstructionsTextState] =
    React.useState(false)
  const [instructionsTextValue, setInstructionsTextValue] = React.useState('')
  const setShowInstructionsText = React.useCallback((value: boolean) => {
    setShowInstructionsTextState(value)
    if (!value) setInstructionsTextValue('')
  }, [])

  const [selectedCustomerTime, setSelectedCustomerTime] = React.useState<
    string | null | undefined
  >(undefined)

  const value = React.useMemo<OrderFormContextValue>(
    () => ({
      showTime,
      setShowTime,
      showCardText,
      setShowCardText,
      cardTextValue,
      setCardTextValue,
      showInstructionsText,
      setShowInstructionsText,
      instructionsTextValue,
      setInstructionsTextValue,
      selectedCustomerTime,
      setSelectedCustomerTime,
    }),
    [
      showTime,
      showCardText,
      setShowCardText,
      cardTextValue,
      showInstructionsText,
      setShowInstructionsText,
      instructionsTextValue,
      selectedCustomerTime,
    ],
  )

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  )
}
