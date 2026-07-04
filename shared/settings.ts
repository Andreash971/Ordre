/**
 * Single source of truth for app settings and theme: schemas, inferred types,
 * defaults, and the merge/migration logic used by BOTH the electron main
 * process and the renderer.
 *
 * Keep this file free of electron/react/DOM imports — it is compiled into
 * both builds.
 */
import * as z from 'zod'

import { customerTypeSchema } from './customers'
import type { CustomerType } from './customers'

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export const themeSchema = z.enum([
  'auto',
  'light',
  'dark',
  'midnight',
  'editorial-florist',
  'ironstone',
])

export type ThemeMode = z.infer<typeof themeSchema>

/** All valid theme values, for runtime validation and UI lists. */
export const THEME_MODES: ReadonlyArray<ThemeMode> = themeSchema.options

// ---------------------------------------------------------------------------
// Settings schema
// ---------------------------------------------------------------------------

export const retentionSchema = z.union([
  z.literal(3),
  z.literal(7),
  z.literal(14),
  z.literal(30),
  z.literal('never'),
])
export type RetentionOption = z.infer<typeof retentionSchema>

export const pageSizeSchema = z.union([
  z.literal(10),
  z.literal(14),
  z.literal(25),
  z.literal(50),
])
export type PageSizeOption = z.infer<typeof pageSizeSchema>

export const companySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  address: z.string(),
  postCode: z.string(),
  phone: z.string(),
})
export type CompanyInfo = z.infer<typeof companySchema>

export const quickSelectSchema = z.object({
  cardSignatures: z.array(z.string()),
  instructionSuggestions: z.array(z.string()),
})
export type QuickSelectSettings = z.infer<typeof quickSelectSchema>

export const bringApiSchema = z.object({
  uid: z.string(),
  apiKey: z.string(),
})
export type BringApiCredentials = z.infer<typeof bringApiSchema>

export const specialItemSchema = z.object({
  name: z.string(),
  price: z.number(),
})
export type SpecialItem = z.infer<typeof specialItemSchema>

export const specialItemKeySchema = z.enum(['frakt', 'leveringstid', 'kort'])
export type SpecialItemKey = z.infer<typeof specialItemKeySchema>

export const SPECIAL_ITEM_KEYS: ReadonlyArray<SpecialItemKey> =
  specialItemKeySchema.options

export type SpecialItemsSettings = Record<SpecialItemKey, SpecialItem>

/** The places in the app that start on a customer-type tab. */
export const customerTypeLocationSchema = z.enum([
  'senderForm',
  'recipientForm',
  'customersPage',
])
export type CustomerTypeLocation = z.infer<typeof customerTypeLocationSchema>

export const CUSTOMER_TYPE_LOCATIONS: ReadonlyArray<CustomerTypeLocation> =
  customerTypeLocationSchema.options

export const customerTypeDefaultsSchema = z.object({
  /** App-wide default customer type; used when perLocation is off. */
  global: customerTypeSchema,
  /** When on, each location uses its own default instead of the global one. */
  perLocation: z.boolean(),
  locations: z.object({
    senderForm: customerTypeSchema,
    recipientForm: customerTypeSchema,
    customersPage: customerTypeSchema,
  }),
})
export type CustomerTypeDefaults = z.infer<typeof customerTypeDefaultsSchema>

export const settingsSchema = z.object({
  archiveRetention: retentionSchema,
  rowsPerPage: pageSizeSchema,
  company: companySchema,
  quickSelect: quickSelectSchema,
  defaultPrinter: z.string().nullable(),
  bringApi: bringApiSchema,
  specialItems: z.object({
    frakt: specialItemSchema,
    leveringstid: specialItemSchema,
    kort: specialItemSchema,
  }),
  autoSaveCustomer: z.boolean(),
  customerTypeDefaults: customerTypeDefaultsSchema,
  betaChannel: z.boolean(),
  deliveryTimePresets: z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.string(),
  ]),
})
export type AppSettings = z.infer<typeof settingsSchema>

/**
 * Shape accepted by "update settings" calls: every field optional, nested
 * objects may themselves be partial.
 */
export const partialSettingsSchema = z.object({
  archiveRetention: retentionSchema.optional(),
  rowsPerPage: pageSizeSchema.optional(),
  company: companySchema.partial().optional(),
  quickSelect: quickSelectSchema.partial().optional(),
  defaultPrinter: z.string().nullable().optional(),
  bringApi: bringApiSchema.partial().optional(),
  specialItems: z
    .object({
      frakt: specialItemSchema.partial().optional(),
      leveringstid: specialItemSchema.partial().optional(),
      kort: specialItemSchema.partial().optional(),
    })
    .optional(),
  autoSaveCustomer: z.boolean().optional(),
  customerTypeDefaults: z
    .object({
      global: customerTypeSchema.optional(),
      perLocation: z.boolean().optional(),
      locations: z
        .object({
          senderForm: customerTypeSchema.optional(),
          recipientForm: customerTypeSchema.optional(),
          customersPage: customerTypeSchema.optional(),
        })
        .optional(),
    })
    .optional(),
  betaChannel: z.boolean().optional(),
  deliveryTimePresets: z
    .tuple([z.string(), z.string(), z.string(), z.string()])
    .optional(),
})
export type PartialSettings = z.infer<typeof partialSettingsSchema>

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_SPECIAL_ITEMS: SpecialItemsSettings = {
  frakt: { name: 'Frakt', price: 100 },
  leveringstid: { name: 'Leveringstid', price: 100 },
  kort: { name: 'Kort', price: 25 },
}

export const DEFAULT_CUSTOMER_TYPE_DEFAULTS: CustomerTypeDefaults = {
  global: 'private',
  perLocation: false,
  locations: {
    senderForm: 'private',
    recipientForm: 'private',
    customersPage: 'private',
  },
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
  customerTypeDefaults: DEFAULT_CUSTOMER_TYPE_DEFAULTS,
  betaChannel: false,
  deliveryTimePresets: ['11:00', '12:00', '14:00', '17:00'],
}

/** The effective default customer type for one location in the app. */
export function resolveCustomerTypeDefault(
  settings: AppSettings,
  location: CustomerTypeLocation,
): CustomerType {
  const d = settings.customerTypeDefaults
  return d.perLocation ? d.locations[location] : d.global
}

// ---------------------------------------------------------------------------
// Migration + merge — the ONLY implementations; both processes call these.
// ---------------------------------------------------------------------------

type PersistedSpecialItems = Partial<SpecialItemsSettings> & {
  fraktTidspunktstillegg?: Partial<SpecialItem>
}

/**
 * Normalize settings as persisted on disk — possibly written by an older app
 * version and missing newer fields — into a fully populated AppSettings.
 */
export function migrateSettings(raw: unknown): AppSettings {
  const persisted = (raw ?? {}) as Partial<AppSettings>
  const special = persisted.specialItems as PersistedSpecialItems | undefined
  return {
    archiveRetention:
      persisted.archiveRetention ?? DEFAULT_SETTINGS.archiveRetention,
    rowsPerPage: persisted.rowsPerPage ?? DEFAULT_SETTINGS.rowsPerPage,
    company: { ...DEFAULT_SETTINGS.company, ...persisted.company },
    quickSelect: {
      cardSignatures: persisted.quickSelect?.cardSignatures ?? [],
      instructionSuggestions:
        persisted.quickSelect?.instructionSuggestions ?? [],
    },
    defaultPrinter: persisted.defaultPrinter ?? null,
    bringApi: { ...DEFAULT_SETTINGS.bringApi, ...persisted.bringApi },
    specialItems: {
      frakt: { ...DEFAULT_SPECIAL_ITEMS.frakt, ...special?.frakt },
      leveringstid: {
        ...DEFAULT_SPECIAL_ITEMS.leveringstid,
        // Values previously stored under the old `fraktTidspunktstillegg`
        // key. Remove on or after 2026-09-28 — by then every active user
        // will have re-persisted under the new key.
        ...special?.fraktTidspunktstillegg,
        ...special?.leveringstid,
      },
      kort: { ...DEFAULT_SPECIAL_ITEMS.kort, ...special?.kort },
    },
    autoSaveCustomer: persisted.autoSaveCustomer ?? false,
    customerTypeDefaults: {
      global:
        persisted.customerTypeDefaults?.global ??
        DEFAULT_CUSTOMER_TYPE_DEFAULTS.global,
      perLocation: persisted.customerTypeDefaults?.perLocation ?? false,
      locations: {
        ...DEFAULT_CUSTOMER_TYPE_DEFAULTS.locations,
        ...persisted.customerTypeDefaults?.locations,
      },
    },
    betaChannel: persisted.betaChannel ?? false,
    deliveryTimePresets:
      persisted.deliveryTimePresets ?? DEFAULT_SETTINGS.deliveryTimePresets,
  }
}

/** Apply a partial update on top of fully populated current settings. */
export function mergeSettings(
  current: AppSettings,
  partial: PartialSettings,
): AppSettings {
  return {
    archiveRetention: partial.archiveRetention ?? current.archiveRetention,
    rowsPerPage: partial.rowsPerPage ?? current.rowsPerPage,
    company: { ...current.company, ...partial.company },
    quickSelect: {
      cardSignatures:
        partial.quickSelect?.cardSignatures ??
        current.quickSelect.cardSignatures,
      instructionSuggestions:
        partial.quickSelect?.instructionSuggestions ??
        current.quickSelect.instructionSuggestions,
    },
    defaultPrinter:
      partial.defaultPrinter !== undefined
        ? partial.defaultPrinter
        : current.defaultPrinter,
    bringApi: { ...current.bringApi, ...partial.bringApi },
    specialItems: {
      frakt: { ...current.specialItems.frakt, ...partial.specialItems?.frakt },
      leveringstid: {
        ...current.specialItems.leveringstid,
        ...partial.specialItems?.leveringstid,
      },
      kort: { ...current.specialItems.kort, ...partial.specialItems?.kort },
    },
    autoSaveCustomer: partial.autoSaveCustomer ?? current.autoSaveCustomer,
    customerTypeDefaults: {
      global:
        partial.customerTypeDefaults?.global ??
        current.customerTypeDefaults.global,
      perLocation:
        partial.customerTypeDefaults?.perLocation ??
        current.customerTypeDefaults.perLocation,
      locations: {
        ...current.customerTypeDefaults.locations,
        ...partial.customerTypeDefaults?.locations,
      },
    },
    betaChannel: partial.betaChannel ?? current.betaChannel,
    deliveryTimePresets:
      partial.deliveryTimePresets ?? current.deliveryTimePresets,
  }
}
