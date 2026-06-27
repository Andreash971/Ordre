import DeliveryDefaults from '#/components/new-order/DeliveryDefaults'
import CardAndInstructions from '#/components/new-order/CardAndInstructions'

interface SharedDetailsProps {
  // Delivery defaults
  date: string
  time: string | null
  showTime: boolean
  leaveDoor: boolean
  leaveNeighbour: boolean
  onDateChange: (date: string) => void
  onTimeChange: (time: string | null) => void
  onShowTimeChange: (show: boolean) => void
  onLeaveDoorChange: (value: boolean) => void
  onLeaveNeighbourChange: (value: boolean) => void

  // Card & instructions
  cardEnabled: boolean
  cardValue: string
  onCardEnabledChange: (enabled: boolean) => void
  onCardValueChange: (value: string) => void
  instructionsEnabled: boolean
  instructionsValue: string
  onInstructionsEnabledChange: (enabled: boolean) => void
  onInstructionsValueChange: (value: string) => void
}

export default function SharedDetails({
  date,
  time,
  showTime,
  leaveDoor,
  leaveNeighbour,
  onDateChange,
  onTimeChange,
  onShowTimeChange,
  onLeaveDoorChange,
  onLeaveNeighbourChange,
  cardEnabled,
  cardValue,
  onCardEnabledChange,
  onCardValueChange,
  instructionsEnabled,
  instructionsValue,
  onInstructionsEnabledChange,
  onInstructionsValueChange,
}: SharedDetailsProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid items-stretch gap-6 p-5 lg:grid-cols-[minmax(0,17rem)_1fr]">
        <DeliveryDefaults
          date={date}
          time={time}
          showTime={showTime}
          leaveDoor={leaveDoor}
          leaveNeighbour={leaveNeighbour}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
          onShowTimeChange={onShowTimeChange}
          onLeaveDoorChange={onLeaveDoorChange}
          onLeaveNeighbourChange={onLeaveNeighbourChange}
        />
        <CardAndInstructions
          cardEnabled={cardEnabled}
          cardValue={cardValue}
          onCardEnabledChange={onCardEnabledChange}
          onCardValueChange={onCardValueChange}
          instructionsEnabled={instructionsEnabled}
          instructionsValue={instructionsValue}
          onInstructionsEnabledChange={onInstructionsEnabledChange}
          onInstructionsValueChange={onInstructionsValueChange}
        />
      </div>
    </div>
  )
}
