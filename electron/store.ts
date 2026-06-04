type RetentionOption = 3 | 7 | 14 | 30 | 'never'
type PageSizeOption = 10 | 14 | 25 | 50

// Source of truth: src/lib/theme.ts
export type ThemeMode =
  | 'auto'
  | 'light'
  | 'dark'
  | 'gray'
  | 'darkblue'
  | 'midnight'
  | 'note'
  | 'sandstone'
  | 'bog'
  | 'ironstone'
  | 'darkforest'

export type CompanyInfo = {
  name: string
  displayName: string
  address: string
  postCode: string
  phone: string
}

export type QuickSelectSettings = {
  cardSignatures: string[]
  instructionSuggestions: string[]
}

export type BringApiCredentials = {
  uid: string
  apiKey: string
}

export type SpecialItemKey = 'frakt' | 'leveringstid' | 'kort'

export type SpecialItem = {
  name: string
  price: number
}

export type SpecialItemsSettings = Record<SpecialItemKey, SpecialItem>

export const DEFAULT_SPECIAL_ITEMS: SpecialItemsSettings = {
  frakt: { name: 'Frakt', price: 100 },
  leveringstid: { name: 'Leveringstid', price: 100 },
  kort: { name: 'Kort', price: 25 },
}

export type AppSettings = {
  archiveRetention: RetentionOption
  rowsPerPage: PageSizeOption
  company: CompanyInfo
  quickSelect: QuickSelectSettings
  defaultPrinter: string | null
  bringApi: BringApiCredentials
  specialItems: SpecialItemsSettings
  autoSaveCustomer: boolean
}

export type StoredOrder = {
  data: unknown
  savedAt: number
  expiresAt: number
  key: string
}

export type StoreSchema = {
  theme: ThemeMode
  settings: AppSettings
  orders: Record<string, StoredOrder>
  onboardingCompleted: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  archiveRetention: 7,
  rowsPerPage: 14,
  defaultPrinter: null,
  company: {
    name: '',
    displayName: '',
    address: '',
    postCode: '',
    phone: '',
  },
  quickSelect: {
    cardSignatures: [],
    instructionSuggestions: [],
  },
  bringApi: {
    uid: '',
    apiKey: '',
  },
  specialItems: DEFAULT_SPECIAL_ITEMS,
  autoSaveCustomer: false,
}

const DEFAULTS: StoreSchema = {
  theme: 'auto',
  settings: DEFAULT_SETTINGS,
  orders: {},
  onboardingCompleted: false,
}

type StoreInstance = {
  get: <TKey extends keyof StoreSchema>(key: TKey) => StoreSchema[TKey]
  set: <TKey extends keyof StoreSchema>(
    key: TKey,
    value: StoreSchema[TKey],
  ) => void
  store: StoreSchema
}

type StoreCtor = new (opts: {
  name?: string
  defaults?: StoreSchema
}) => StoreInstance

const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<{ default: StoreCtor }>

let storePromise: Promise<StoreInstance> | null = null

export function getStore(): Promise<StoreInstance> {
  if (!storePromise) {
    storePromise = (async () => {
      const mod = await dynamicImport('electron-store')
      const Store = mod.default
      return new Store({ name: 'config', defaults: DEFAULTS })
    })()
  }
  return storePromise
}
