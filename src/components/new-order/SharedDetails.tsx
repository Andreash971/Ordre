import type { Dispatch } from 'react'

import DeliveryDefaults from '@/components/new-order/DeliveryDefaults'
import CardAndInstructions from '@/components/new-order/CardAndInstructions'
import type {
  OrderDraft,
  OrderDraftAction,
} from '@/components/new-order/order-draft'
import { useSettings } from '@/lib/store-hooks'

interface SharedDetailsProps {
  draft: OrderDraft
  dispatch: Dispatch<OrderDraftAction>
}

export default function SharedDetails({ draft, dispatch }: SharedDetailsProps) {
  const specialItems = useSettings().specialItems

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid items-stretch gap-6 p-5 lg:grid-cols-[minmax(0,17rem)_1fr]">
        <DeliveryDefaults
          date={draft.delivery.date}
          time={draft.delivery.time}
          showTime={draft.showTime}
          leaveDoor={draft.delivery.leaveDoor}
          leaveNeighbour={draft.delivery.leaveNeighbour}
          onDateChange={(date) =>
            dispatch({ type: 'patchDelivery', patch: { date } })
          }
          onTimeChange={(time) =>
            dispatch({ type: 'patchDelivery', patch: { time } })
          }
          onShowTimeChange={(value) =>
            dispatch({ type: 'setShowTime', value, specialItems })
          }
          onLeaveDoorChange={(leaveDoor) =>
            dispatch({ type: 'patchDelivery', patch: { leaveDoor } })
          }
          onLeaveNeighbourChange={(leaveNeighbour) =>
            dispatch({ type: 'patchDelivery', patch: { leaveNeighbour } })
          }
        />
        <CardAndInstructions
          cardEnabled={draft.card.enabled}
          cardValue={draft.card.text}
          onCardEnabledChange={(value) =>
            dispatch({ type: 'setCardEnabled', value, specialItems })
          }
          onCardValueChange={(value) =>
            dispatch({ type: 'setCardText', value })
          }
          instructionsEnabled={draft.instructions.enabled}
          instructionsValue={draft.instructions.text}
          onInstructionsEnabledChange={(value) =>
            dispatch({ type: 'setInstructionsEnabled', value })
          }
          onInstructionsValueChange={(value) =>
            dispatch({ type: 'setInstructionsText', value })
          }
        />
      </div>
    </div>
  )
}
