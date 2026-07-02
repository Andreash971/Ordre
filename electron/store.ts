import type { AppSettings, ThemeMode } from '../shared/settings'
import { DEFAULT_SETTINGS } from '../shared/settings'
import type { StoredOrder } from '../shared/orders'

export type StoreSchema = {
  theme: ThemeMode
  settings: AppSettings
  orders: Record<string, StoredOrder>
  onboardingCompleted: boolean
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

// electron-store v11 is ESM-only while the main process compiles to CJS;
// the Function wrapper stops tsc from downleveling import() to require().
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
