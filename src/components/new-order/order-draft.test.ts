import { describe, expect, it } from 'vitest'

import { DEFAULT_SPECIAL_ITEMS } from '@shared/settings'
import type { OrderDraft } from './order-draft'
import { initOrderDraft, orderDraftReducer } from './order-draft'

const specialItems = DEFAULT_SPECIAL_ITEMS

function countRows(draft: OrderDraft, key: string): number {
  return draft.items.filter((i) => i.specialKey === key).length
}

describe('orderDraftReducer — special items', () => {
  it('starts with exactly one frakt row', () => {
    const draft = initOrderDraft({ specialItems, senderType: 'private' })
    expect(countRows(draft, 'frakt')).toBe(1)
    expect(draft.items).toHaveLength(1)
  })

  it('adds the leveringstid row exactly once when showTime toggles on', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'setShowTime',
      value: true,
      specialItems,
    })
    draft = orderDraftReducer(draft, {
      type: 'setShowTime',
      value: true,
      specialItems,
    })
    expect(draft.showTime).toBe(true)
    expect(countRows(draft, 'leveringstid')).toBe(1)
    expect(draft.items.at(-1)).toMatchObject({
      specialKey: 'leveringstid',
      name: specialItems.leveringstid.name,
      price: specialItems.leveringstid.price,
    })
  })

  it('removes the leveringstid row when showTime toggles off', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'setShowTime',
      value: true,
      specialItems,
    })
    draft = orderDraftReducer(draft, {
      type: 'setShowTime',
      value: false,
      specialItems,
    })
    expect(draft.showTime).toBe(false)
    expect(countRows(draft, 'leveringstid')).toBe(0)
  })

  it('specialPicked kort enables the card and never duplicates an existing row', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    // Simulate the picker path: OrderItems adds the row first, then reports.
    draft = orderDraftReducer(draft, {
      type: 'updateItems',
      updater: (items) => [
        ...items,
        {
          specialKey: 'kort',
          name: specialItems.kort.name,
          description: '',
          price: specialItems.kort.price,
          quantity: 1,
        },
      ],
    })
    draft = orderDraftReducer(draft, {
      type: 'specialPicked',
      key: 'kort',
      specialItems,
    })
    expect(draft.card.enabled).toBe(true)
    expect(countRows(draft, 'kort')).toBe(1)
  })

  it('specialRemoved kort disables the card, clears its text, and drops the row', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'setCardEnabled',
      value: true,
      specialItems,
    })
    draft = orderDraftReducer(draft, { type: 'setCardText', value: 'Hilsen A' })
    draft = orderDraftReducer(draft, { type: 'specialRemoved', key: 'kort' })
    expect(draft.card).toEqual({ enabled: false, text: '' })
    expect(countRows(draft, 'kort')).toBe(0)
  })

  it('toggling the card off keeps the text (only explicit removal clears it)', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'setCardEnabled',
      value: true,
      specialItems,
    })
    draft = orderDraftReducer(draft, { type: 'setCardText', value: 'Hilsen A' })
    draft = orderDraftReducer(draft, {
      type: 'setCardEnabled',
      value: false,
      specialItems,
    })
    expect(draft.card).toEqual({ enabled: false, text: 'Hilsen A' })
    expect(countRows(draft, 'kort')).toBe(0)
  })
})

describe('orderDraftReducer — recipients', () => {
  it('new recipients inherit the current shared defaults', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'patchDelivery',
      patch: { date: '2026-07-10', leaveDoor: true },
    })
    draft = orderDraftReducer(draft, {
      type: 'setCardEnabled',
      value: true,
      specialItems,
    })
    draft = orderDraftReducer(draft, {
      type: 'setCardText',
      value: 'Gratulerer',
    })
    draft = orderDraftReducer(draft, {
      type: 'addRecipient',
      customerType: 'private',
    })

    expect(draft.recipients).toHaveLength(1)
    expect(draft.recipients[0]).toMatchObject({
      selection: { type: 'private', customerId: null, contactId: null },
      date: '2026-07-10',
      leaveDoor: true,
      cardmsg: 'Gratulerer',
    })
  })

  it('keeps the selection attached to the right recipient through patch and remove', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'addRecipient',
      customerType: 'private',
    })
    draft = orderDraftReducer(draft, {
      type: 'addRecipient',
      customerType: 'private',
    })
    draft = orderDraftReducer(draft, {
      type: 'addRecipient',
      customerType: 'private',
    })

    draft = orderDraftReducer(draft, {
      type: 'patchRecipient',
      index: 0,
      patch: { name: 'Anna' },
    })
    draft = orderDraftReducer(draft, {
      type: 'patchRecipient',
      index: 1,
      patch: { name: 'Bjørn' },
    })
    draft = orderDraftReducer(draft, {
      type: 'patchRecipient',
      index: 2,
      patch: { name: 'Clara' },
    })
    draft = orderDraftReducer(draft, {
      type: 'setRecipientSelection',
      index: 1,
      selection: { type: 'private', customerId: 42, contactId: null },
    })

    // Removing the first recipient must not shift Bjørn's id onto Clara.
    draft = orderDraftReducer(draft, { type: 'removeRecipient', index: 0 })

    expect(
      draft.recipients.map((r) => [r.name, r.selection.customerId]),
    ).toEqual([
      ['Bjørn', 42],
      ['Clara', null],
    ])
  })

  it('patching a recipient does not clobber its selection', () => {
    let draft = initOrderDraft({ specialItems, senderType: 'private' })
    draft = orderDraftReducer(draft, {
      type: 'addRecipient',
      customerType: 'private',
    })
    draft = orderDraftReducer(draft, {
      type: 'setRecipientSelection',
      index: 0,
      selection: { type: 'business', customerId: 7, contactId: 3 },
    })
    draft = orderDraftReducer(draft, {
      type: 'patchRecipient',
      index: 0,
      patch: { name: 'Ola', phone: '99887766' },
    })
    expect(draft.recipients[0]).toMatchObject({
      name: 'Ola',
      phone: '99887766',
      selection: { type: 'business', customerId: 7, contactId: 3 },
    })
  })
})
