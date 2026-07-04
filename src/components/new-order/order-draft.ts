/**
 * All state for the new-order page in one reducer. Special-item rows
 * (frakt/leveringstid/kort) follow their toggles synchronously here instead
 * of via component effects, so a dispatch can never double-fire or leave the
 * items list out of sync with the toggles.
 */
import type { SetStateAction } from 'react'

import type { Item } from '@/components/OrderColumns'
import type {
  Customer,
  CustomerFormValues,
  DeliveryValues,
} from '@/lib/order-utils'
import type { SpecialItemKey, SpecialItemsSettings } from '@/lib/settings'
import type { CustomerSelection, CustomerType } from '@shared/customers'
import { toIsoDate } from '@/lib/format'

function emptySelection(type: CustomerType): CustomerSelection {
  return { type, customerId: null, contactId: null }
}

/** A recipient carries which saved customer/contact it was loaded from. */
export type Recipient = Customer & { selection: CustomerSelection }

export type OrderDraft = {
  sender: CustomerFormValues
  senderSelection: CustomerSelection
  delivery: DeliveryValues
  showTime: boolean
  card: { enabled: boolean; text: string }
  instructions: { enabled: boolean; text: string }
  items: Item[]
  recipients: Recipient[]
}

/** The shared (master) values each recipient inherits and may override. */
export type SharedOrderDefaults = {
  delivery: DeliveryValues
  showTime: boolean
  cardEnabled: boolean
  cardValue: string
  instructionsEnabled: boolean
  instructionsValue: string
}

export function sharedDefaults(draft: OrderDraft): SharedOrderDefaults {
  return {
    delivery: draft.delivery,
    showTime: draft.showTime,
    cardEnabled: draft.card.enabled,
    cardValue: draft.card.text,
    instructionsEnabled: draft.instructions.enabled,
    instructionsValue: draft.instructions.text,
  }
}

export const EMPTY_SENDER: CustomerFormValues = {
  name: '',
  phone: '',
  company: '',
  address: '',
  postcode: '',
  city: '',
  careof: '',
}

export type OrderDraftAction =
  | { type: 'setSender'; values: CustomerFormValues }
  | { type: 'setSenderSelection'; selection: CustomerSelection }
  | { type: 'patchDelivery'; patch: Partial<DeliveryValues> }
  | { type: 'setShowTime'; value: boolean; specialItems: SpecialItemsSettings }
  | {
      type: 'setCardEnabled'
      value: boolean
      specialItems: SpecialItemsSettings
    }
  | { type: 'setCardText'; value: string }
  | { type: 'setInstructionsEnabled'; value: boolean }
  | { type: 'setInstructionsText'; value: string }
  | { type: 'updateItems'; updater: SetStateAction<Item[]> }
  | {
      type: 'specialPicked'
      key: SpecialItemKey
      specialItems: SpecialItemsSettings
    }
  | { type: 'specialRemoved'; key: SpecialItemKey }
  | { type: 'addRecipient'; customerType: CustomerType }
  | { type: 'patchRecipient'; index: number; patch: Partial<Customer> }
  | {
      type: 'setRecipientSelection'
      index: number
      selection: CustomerSelection
    }
  | { type: 'removeRecipient'; index: number }

function specialRow(
  key: SpecialItemKey,
  specialItems: SpecialItemsSettings,
): Item {
  const def = specialItems[key]
  return {
    specialKey: key,
    name: def.name,
    description: '',
    price: def.price,
    quantity: 1,
  }
}

function withSpecialRow(
  items: Item[],
  key: SpecialItemKey,
  specialItems: SpecialItemsSettings,
): Item[] {
  if (items.some((i) => i.specialKey === key)) return items
  return [...items, specialRow(key, specialItems)]
}

function withoutSpecialRow(items: Item[], key: SpecialItemKey): Item[] {
  return items.filter((i) => i.specialKey !== key)
}

/** New recipient inheriting the current shared defaults. */
function emptyRecipient(draft: OrderDraft, type: CustomerType): Recipient {
  return {
    selection: emptySelection(type),
    name: '',
    phone: '',
    company: '',
    address: '',
    postcode: '',
    city: '',
    careof: '',
    cardmsg: draft.card.enabled ? draft.card.text : '',
    instructmsg: draft.instructions.enabled ? draft.instructions.text : '',
    date: draft.delivery.date,
    time: draft.delivery.time,
    leaveDoor: draft.delivery.leaveDoor,
    leaveNeighbour: draft.delivery.leaveNeighbour,
  }
}

export function initOrderDraft({
  specialItems,
  senderType,
}: {
  specialItems: SpecialItemsSettings
  senderType: CustomerType
}): OrderDraft {
  return {
    sender: EMPTY_SENDER,
    senderSelection: emptySelection(senderType),
    delivery: {
      date: toIsoDate(),
      time: null,
      leaveDoor: false,
      leaveNeighbour: false,
    },
    showTime: false,
    card: { enabled: false, text: '' },
    instructions: { enabled: false, text: '' },
    items: [specialRow('frakt', specialItems)],
    recipients: [],
  }
}

export function orderDraftReducer(
  draft: OrderDraft,
  action: OrderDraftAction,
): OrderDraft {
  switch (action.type) {
    case 'setSender':
      return { ...draft, sender: action.values }
    case 'setSenderSelection':
      return { ...draft, senderSelection: action.selection }
    case 'patchDelivery':
      return { ...draft, delivery: { ...draft.delivery, ...action.patch } }
    case 'setShowTime':
      return {
        ...draft,
        showTime: action.value,
        items: action.value
          ? withSpecialRow(draft.items, 'leveringstid', action.specialItems)
          : withoutSpecialRow(draft.items, 'leveringstid'),
      }
    case 'setCardEnabled':
      return {
        ...draft,
        card: { ...draft.card, enabled: action.value },
        items: action.value
          ? withSpecialRow(draft.items, 'kort', action.specialItems)
          : withoutSpecialRow(draft.items, 'kort'),
      }
    case 'setCardText':
      return { ...draft, card: { ...draft.card, text: action.value } }
    case 'setInstructionsEnabled':
      return {
        ...draft,
        instructions: { ...draft.instructions, enabled: action.value },
      }
    case 'setInstructionsText':
      return {
        ...draft,
        instructions: { ...draft.instructions, text: action.value },
      }
    case 'updateItems':
      return {
        ...draft,
        items:
          typeof action.updater === 'function'
            ? action.updater(draft.items)
            : action.updater,
      }
    case 'specialPicked':
      switch (action.key) {
        case 'leveringstid':
          return orderDraftReducer(draft, {
            type: 'setShowTime',
            value: true,
            specialItems: action.specialItems,
          })
        case 'kort':
          return orderDraftReducer(draft, {
            type: 'setCardEnabled',
            value: true,
            specialItems: action.specialItems,
          })
        case 'frakt':
          return {
            ...draft,
            items: withSpecialRow(draft.items, 'frakt', action.specialItems),
          }
      }
      return draft
    case 'specialRemoved':
      switch (action.key) {
        case 'leveringstid':
          return {
            ...draft,
            showTime: false,
            items: withoutSpecialRow(draft.items, 'leveringstid'),
          }
        case 'kort':
          // Explicit removal warns that the card text will be deleted, so
          // clear it — unlike a plain toggle-off, which keeps the text.
          return {
            ...draft,
            card: { enabled: false, text: '' },
            items: withoutSpecialRow(draft.items, 'kort'),
          }
        case 'frakt':
          return { ...draft, items: withoutSpecialRow(draft.items, 'frakt') }
      }
      return draft
    case 'addRecipient':
      return {
        ...draft,
        recipients: [
          ...draft.recipients,
          emptyRecipient(draft, action.customerType),
        ],
      }
    case 'patchRecipient':
      return {
        ...draft,
        recipients: draft.recipients.map((r, i) =>
          i === action.index ? { ...r, ...action.patch } : r,
        ),
      }
    case 'setRecipientSelection':
      return {
        ...draft,
        recipients: draft.recipients.map((r, i) =>
          i === action.index ? { ...r, selection: action.selection } : r,
        ),
      }
    case 'removeRecipient':
      return {
        ...draft,
        recipients: draft.recipients.filter((_, i) => i !== action.index),
      }
  }
}
