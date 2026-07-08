/**
 * Module registry: optional feature areas ("moduler") the user turns on or
 * off during onboarding and later under Innstillinger. Shared by the electron
 * main process and the renderer — keep this file free of electron/react/DOM
 * imports.
 *
 * Adding a new module:
 *   1. Add its id to `moduleIdSchema` and a field to `modulesSchema`.
 *   2. Describe it in `MODULE_DEFINITIONS` — name/description are what the
 *      onboarding step and the settings section display; `defaultEnabled` is
 *      what users upgrading from a version without the module get.
 *   3. Give it an icon in ModuleToggleList and gate the feature's UI behind
 *      `useModules()` (src/lib/store-hooks.ts).
 * Persistence, migration, onboarding, and the settings UI follow the
 * registry automatically.
 */
import * as z from 'zod'

import { customerTypeSchema } from './customers'
import type { CustomerType } from './customers'

export const moduleIdSchema = z.enum(['privateCustomers', 'businessCustomers'])
export type ModuleId = z.infer<typeof moduleIdSchema>

export const MODULE_IDS: ReadonlyArray<ModuleId> = moduleIdSchema.options

export type ModuleDefinition = {
  id: ModuleId
  /** Short display name used in onboarding and settings. */
  name: string
  /** One-sentence explanation of what enabling the module gives. */
  description: string
  /**
   * State for installs whose persisted settings predate the module. Both
   * customer-type modules default to enabled so an upgrade never hides
   * existing rows — pre-split installs only held "kunde" (now 'private')
   * data, later ones may hold both types.
   */
  defaultEnabled: boolean
}

export const MODULE_DEFINITIONS: ReadonlyArray<ModuleDefinition> = [
  {
    id: 'privateCustomers',
    name: 'Privatkunder',
    description: 'Kunderegister og kundeskjemaer for privatpersoner.',
    defaultEnabled: true,
  },
  {
    id: 'businessCustomers',
    name: 'Firmakunder',
    description:
      'Kunderegister og kundeskjemaer for firmaer, med representanter per firma.',
    defaultEnabled: true,
  },
]

export const modulesSchema = z.object({
  privateCustomers: z.boolean(),
  businessCustomers: z.boolean(),
})
export type ModulesSettings = z.infer<typeof modulesSchema>

export const DEFAULT_MODULES: ModulesSettings = Object.fromEntries(
  MODULE_DEFINITIONS.map((m) => [m.id, m.defaultEnabled]),
) as Record<ModuleId, boolean>

/** Which module gates each customer type. */
export const CUSTOMER_TYPE_MODULES: Record<CustomerType, ModuleId> = {
  private: 'privateCustomers',
  business: 'businessCustomers',
}

/** The customer types whose module is enabled, in schema order. */
export function enabledCustomerTypes(
  modules: ModulesSettings,
): Array<CustomerType> {
  return customerTypeSchema.options.filter(
    (type) => modules[CUSTOMER_TYPE_MODULES[type]],
  )
}

/**
 * Fill module flags missing from settings persisted by older app versions,
 * and keep the state usable: the app has no meaning without a customer
 * register, so if every customer-type module is off, fall back to private —
 * the type the original single "kunde" data migrated to.
 */
export function normalizeModules(
  persisted?: Partial<ModulesSettings> | null,
): ModulesSettings {
  const modules = { ...DEFAULT_MODULES, ...persisted }
  if (enabledCustomerTypes(modules).length === 0) {
    modules.privateCustomers = true
  }
  return modules
}

/**
 * The given type if its module is enabled, otherwise the first enabled type.
 * Use for defaults and fresh forms — not for rows loaded from the database,
 * which keep their stored type even when the module is off.
 */
export function clampCustomerType(
  modules: ModulesSettings,
  type: CustomerType,
): CustomerType {
  if (modules[CUSTOMER_TYPE_MODULES[type]]) return type
  return enabledCustomerTypes(modules)[0] ?? 'private'
}
