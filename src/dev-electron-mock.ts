/**
 * TEMPORARY browser-preview mock of window.electronAPI — used only to
 * verify the dashboard redesign in a plain browser. Do not commit.
 */
import { DEFAULT_SETTINGS } from '@shared/settings'
import type { ArchivedOrder, OrderData, OrderSource } from '@shared/orders'
import { toIsoDate } from '@/lib/format'
import { formatDeliveryDate } from '@/lib/order-utils'

function iso(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return toIsoDate(d)
}

let seq = 0
function makeOrder(opts: {
  offsetDays: number
  time?: string
  receiver: string
  receiverCompany?: string
  business?: boolean
  address?: string
  postCode?: string
  phone?: string
  sender: string
  senderCompany?: string
  senderBusiness?: boolean
  sum: number
  legacy?: boolean
  noCard?: boolean
}): ArchivedOrder {
  const cardText = opts.noCard ? '' : 'Gratulerer med dagen!'
  const date = iso(opts.offsetDays)
  const info = formatDeliveryDate(date)
  const items = [
    {
      product: 'Roser, røde — 12 stk',
      quantity: 1,
      price: opts.sum - 198,
      total: opts.sum - 198,
    },
    { product: 'Frakt', quantity: 1, price: 149, total: 149 },
    { product: 'Kort', quantity: 1, price: 49, total: 49 },
  ]
  const data: OrderData = {
    company: {
      name: 'Blomster i Byhaven AS',
      displayName: 'Blomster i Byhaven',
      address: 'Storgata 1',
      postCode: '0155 Oslo',
      phone: '+47 22 00 00 00',
    },
    delivery: {
      dayText: info.dayText,
      longDate: info.longDate,
      shortDate: info.shortDate,
      deliveryTime: opts.time ?? '',
      deliveryLeaveDoor: 'Nei',
      deliveryLeaveNeighbour: 'Ja',
    },
    sender: {
      name: opts.sender,
      address: 'Storgata 14',
      postCode: '0184 Oslo',
      phone: '+47 922 14 008',
      company: opts.senderCompany ?? '',
    },
    receiver: {
      name: opts.receiver,
      company: opts.receiverCompany ?? '',
      co: '',
      address: opts.address ?? '',
      postCode: opts.postCode ?? '',
      phone: opts.phone ?? '',
    },
    card: {
      cardText,
      instructionsText: '',
    },
    orderContent: items,
  }
  const source: OrderSource | null = opts.legacy
    ? null
    : {
        customer: {
          selection: {
            type: opts.business ? ('business' as const) : ('private' as const),
            customerId: null,
            contactId: null,
          },
          name: opts.receiver,
          phone: opts.phone ?? '',
          company: opts.receiverCompany ?? '',
          address: opts.address ?? '',
          postcode: (opts.postCode ?? '').split(' ')[0] ?? '',
          city: (opts.postCode ?? '').split(' ').slice(1).join(' '),
          careof: '',
          cardmsg: cardText,
          instructmsg: '',
          date,
          time: opts.time ?? null,
          leaveDoor: false,
          leaveNeighbour: true,
        },
        sender: {
          selection: {
            type: opts.senderBusiness
              ? ('business' as const)
              : ('private' as const),
            customerId: null,
            contactId: null,
          },
          name: opts.sender,
          phone: '+47 922 14 008',
          company: opts.senderCompany ?? '',
          address: 'Storgata 14',
          postcode: '0184',
          city: 'Oslo',
          careof: '',
        },
        delivery: {
          date,
          time: opts.time ?? null,
          leaveDoor: false,
          leaveNeighbour: true,
        },
        items: items.map((i) => ({
          name: i.product,
          description: '',
          price: i.price,
          quantity: i.quantity,
        })),
      }
  seq += 1
  return {
    id: `mock-${seq}`,
    savedAt: Date.now() - seq * 3600_000,
    expiresAt: null,
    deliveryDate: date,
    source,
    data,
  }
}

let ORDERS: ArchivedOrder[] = [
  makeOrder({
    offsetDays: 0,
    time: '12:00',
    receiver: 'Anne Lie',
    address: 'Kirkeveien 22',
    postCode: '0364 Oslo',
    phone: '+47 901 22 540',
    sender: 'Bjørn Hansen',
    senderCompany: 'Hansen Eiendom AS',
    senderBusiness: true,
    sum: 2295,
  }),
  makeOrder({
    offsetDays: 0,
    time: '14:00',
    receiver: 'Nina Eide',
    receiverCompany: 'Sykehjemmet Vest',
    business: true,
    address: 'Lindeveien 4',
    postCode: '0283 Oslo',
    phone: '+47 22 51 80 00',
    sender: 'Marit Five',
    sum: 890,
  }),
  makeOrder({
    offsetDays: 1,
    time: '11:00',
    receiver: 'Per Olsen',
    address: 'Bygdøy allé 5',
    postCode: '0257 Oslo',
    sender: 'Bjørn Hansen',
    senderCompany: 'Hansen Eiendom AS',
    senderBusiness: true,
    sum: 749,
    noCard: true,
  }),
  makeOrder({
    offsetDays: 3,
    receiver: 'Kari Nordmann',
    sender: 'Kari Nordmann',
    sum: 1340,
    legacy: true,
  }),
  makeOrder({
    offsetDays: 4,
    time: '09:00',
    receiver: 'Begravelsesbyrå Ro',
    address: 'Kapellveien 2',
    postCode: '0369 Oslo',
    phone: '+47 23 12 00 00',
    sender: 'Familien Berg',
    sum: 4200,
  }),
]

const asyncNoop = async () => undefined

const mock = {
  store: {
    getAll: async () => ({
      theme: 'auto',
      settings: DEFAULT_SETTINGS,
      onboardingCompleted: true,
    }),
    setTheme: asyncNoop,
    setSettings: async () => DEFAULT_SETTINGS,
    setOnboardingCompleted: asyncNoop,
  },
  orders: {
    getAll: async () => ORDERS,
    insert: asyncNoop,
    update: async (payload: {
      id: string
      source: OrderSource | null
      data: OrderData
    }) => {
      const idx = ORDERS.findIndex((o) => o.id === payload.id)
      if (idx === -1) return null
      const updated: ArchivedOrder = {
        ...ORDERS[idx],
        id: `${payload.id}-v2`,
        savedAt: Date.now(),
        source: payload.source,
        data: payload.data,
      }
      ORDERS = [...ORDERS.slice(0, idx), updated, ...ORDERS.slice(idx + 1)]
      return updated
    },
    delete: async (id: string) => {
      ORDERS = ORDERS.filter((o) => o.id !== id)
    },
    clear: asyncNoop,
    pruneExpired: asyncNoop,
  },
  update: {
    getPending: async () => null,
    onAvailable: () => () => undefined,
    install: asyncNoop,
  },
}

// Any domain/method not mocked above resolves to undefined instead of crashing.
;(window as unknown as { electronAPI: unknown }).electronAPI = new Proxy(mock, {
  get(target, key) {
    if (key in target) return target[key as keyof typeof target]
    // Synchronous no-op: works both for awaited calls and for
    // subscription APIs that must return an unsubscribe function.
    return new Proxy({}, { get: () => () => () => undefined })
  },
})
