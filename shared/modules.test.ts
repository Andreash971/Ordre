import { describe, expect, it } from 'vitest'

import {
  DEFAULT_MODULES,
  MODULE_DEFINITIONS,
  MODULE_IDS,
  clampCustomerType,
  enabledCustomerTypes,
  modulesSchema,
  normalizeModules,
} from './modules'

describe('module registry', () => {
  it('defines every module id exactly once', () => {
    expect(MODULE_DEFINITIONS.map((m) => m.id).sort()).toEqual(
      [...MODULE_IDS].sort(),
    )
  })

  it('keeps the persisted schema in sync with the registry', () => {
    expect(Object.keys(modulesSchema.shape).sort()).toEqual(
      [...MODULE_IDS].sort(),
    )
  })
})

describe('normalizeModules', () => {
  it('enables everything by default for settings without module flags', () => {
    expect(normalizeModules(undefined)).toEqual(DEFAULT_MODULES)
    expect(normalizeModules({})).toEqual(DEFAULT_MODULES)
    expect(DEFAULT_MODULES).toEqual({
      privateCustomers: true,
      businessCustomers: true,
    })
  })

  it('keeps a valid persisted choice', () => {
    expect(
      normalizeModules({ privateCustomers: false, businessCustomers: true }),
    ).toEqual({ privateCustomers: false, businessCustomers: true })
  })

  it('falls back to private when every customer-type module is off', () => {
    expect(
      normalizeModules({ privateCustomers: false, businessCustomers: false }),
    ).toEqual({ privateCustomers: true, businessCustomers: false })
  })
})

describe('enabledCustomerTypes', () => {
  it('maps module flags to customer types in schema order', () => {
    expect(enabledCustomerTypes(DEFAULT_MODULES)).toEqual([
      'private',
      'business',
    ])
    expect(
      enabledCustomerTypes({
        privateCustomers: false,
        businessCustomers: true,
      }),
    ).toEqual(['business'])
  })
})

describe('clampCustomerType', () => {
  it('keeps a type whose module is enabled', () => {
    expect(clampCustomerType(DEFAULT_MODULES, 'business')).toBe('business')
  })

  it('falls back to the first enabled type otherwise', () => {
    expect(
      clampCustomerType(
        { privateCustomers: true, businessCustomers: false },
        'business',
      ),
    ).toBe('private')
    expect(
      clampCustomerType(
        { privateCustomers: false, businessCustomers: true },
        'private',
      ),
    ).toBe('business')
  })
})
