import { describe, expect, it } from 'vitest'

import type { Item } from '@/components/OrderColumns'
import type { Customer } from './order-utils'
import { buildOrderData } from './order-utils'

const baseCustomer: Customer = {
  name: 'Bjørn Sørli',
  phone: '99887766',
  company: '',
  address: 'Testveien 1',
  postcode: '7000',
  city: 'Trondheim',
  careof: '',
  cardmsg: '',
  instructmsg: '',
  date: '2026-07-10',
  time: null,
  leaveDoor: false,
  leaveNeighbour: true,
}

const items: Item[] = [
  { name: 'Bukett', description: '', price: 450, quantity: 2 },
  {
    specialKey: 'frakt',
    name: 'Frakt',
    description: '',
    price: 100,
    quantity: 1,
  },
  {
    specialKey: 'leveringstid',
    name: 'Leveringstid',
    description: '',
    price: 100,
    quantity: 1,
  },
  { specialKey: 'kort', name: 'Kort', description: '', price: 25, quantity: 1 },
]

const delivery = {
  date: '2026-07-08',
  time: null,
  leaveDoor: false,
  leaveNeighbour: false,
}

describe('buildOrderData', () => {
  it('drops the leveringstid line when the recipient has no delivery time', () => {
    // baseCustomer also has no card text, so the Kort line is dropped too.
    const data = buildOrderData(baseCustomer, null, delivery, items)
    expect(data.orderContent.map((l) => l.product)).toEqual(['Bukett', 'Frakt'])
  })

  it('keeps the leveringstid line when a delivery time is set', () => {
    const data = buildOrderData(
      { ...baseCustomer, time: '12:00' },
      null,
      delivery,
      items,
    )
    expect(data.orderContent.map((l) => l.product)).toContain('Leveringstid')
    expect(data.delivery.deliveryTime).toBe('12:00')
  })

  it('drops the kort line when the card text is empty or whitespace', () => {
    const blank = buildOrderData(
      { ...baseCustomer, cardmsg: '   ' },
      null,
      delivery,
      items,
    )
    expect(blank.orderContent.map((l) => l.product)).not.toContain('Kort')

    const withCard = buildOrderData(
      { ...baseCustomer, cardmsg: 'Gratulerer!' },
      null,
      delivery,
      items,
    )
    expect(withCard.orderContent.map((l) => l.product)).toContain('Kort')
    expect(withCard.card.cardText).toBe('Gratulerer!')
  })

  it('uses the recipient date over the shared date and computes line totals', () => {
    const data = buildOrderData(baseCustomer, null, delivery, items)
    expect(data.delivery.shortDate).toBe('10.07.2026')
    expect(data.orderContent[0]).toMatchObject({
      product: 'Bukett',
      quantity: 2,
      total: 900,
    })
    expect(data.delivery.deliveryLeaveNeighbour).toBe('Ja')
    expect(data.delivery.deliveryLeaveDoor).toBe('Nei')
  })

  it('falls back to the shared date when the recipient has none', () => {
    const data = buildOrderData(
      { ...baseCustomer, date: '' },
      null,
      delivery,
      items,
    )
    expect(data.delivery.shortDate).toBe('08.07.2026')
  })

  it('renders empty sender fields when no sender is given', () => {
    const data = buildOrderData(baseCustomer, null, delivery, items)
    expect(data.sender).toEqual({
      name: '',
      address: '',
      postCode: '',
      phone: '',
      company: '',
    })
  })

  it('snapshots a business recipient: the company with the chosen representative as contact', () => {
    // A business recipient arrives as the same flat shape: company fields
    // from the company row, name/phone from the selected representative.
    const data = buildOrderData(
      {
        ...baseCustomer,
        name: 'Nina Berg',
        phone: '90011223',
        company: 'Fjellblomst AS',
        address: 'Bergveien 2',
        postcode: '5003',
        city: 'Bergen',
      },
      null,
      delivery,
      items,
    )
    expect(data.receiver).toMatchObject({
      name: 'Nina Berg',
      company: 'Fjellblomst AS',
      address: 'Bergveien 2',
      postCode: '5003 Bergen',
      phone: '90011223',
    })
  })
})
