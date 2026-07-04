import { describe, expect, it } from 'vitest'

import {
  DEFAULT_SETTINGS,
  DEFAULT_SPECIAL_ITEMS,
  mergeSettings,
  migrateSettings,
  resolveCustomerTypeDefault,
} from './settings'

describe('migrateSettings', () => {
  it('returns full defaults for empty/undefined persisted data', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(migrateSettings({})).toEqual(DEFAULT_SETTINGS)
  })

  it('fills fields missing from older app versions', () => {
    const migrated = migrateSettings({
      archiveRetention: 30,
      company: { name: 'Blomster AS' },
    })
    expect(migrated.archiveRetention).toBe(30)
    expect(migrated.company.name).toBe('Blomster AS')
    expect(migrated.company.displayName).toBe('')
    expect(migrated.rowsPerPage).toBe(DEFAULT_SETTINGS.rowsPerPage)
    expect(migrated.deliveryTimePresets).toEqual(
      DEFAULT_SETTINGS.deliveryTimePresets,
    )
    expect(migrated.specialItems).toEqual(DEFAULT_SPECIAL_ITEMS)
  })

  it('carries values from the legacy fraktTidspunktstillegg key into leveringstid', () => {
    const migrated = migrateSettings({
      specialItems: {
        fraktTidspunktstillegg: { name: 'Tidspunkt', price: 150 },
      },
    })
    expect(migrated.specialItems.leveringstid).toEqual({
      name: 'Tidspunkt',
      price: 150,
    })
  })

  it('prefers the new leveringstid key over the legacy one', () => {
    const migrated = migrateSettings({
      specialItems: {
        fraktTidspunktstillegg: { name: 'Gammel', price: 1 },
        leveringstid: { name: 'Ny', price: 2 },
      },
    })
    expect(migrated.specialItems.leveringstid).toEqual({
      name: 'Ny',
      price: 2,
    })
  })
})

describe('mergeSettings', () => {
  it('applies a shallow partial without touching other fields', () => {
    const next = mergeSettings(DEFAULT_SETTINGS, { archiveRetention: 3 })
    expect(next.archiveRetention).toBe(3)
    expect(next.rowsPerPage).toBe(DEFAULT_SETTINGS.rowsPerPage)
    expect(next.company).toEqual(DEFAULT_SETTINGS.company)
  })

  it('deep-merges nested partials', () => {
    const next = mergeSettings(DEFAULT_SETTINGS, {
      company: { name: 'Blomster AS' },
      specialItems: { kort: { price: 30 } },
    })
    expect(next.company.name).toBe('Blomster AS')
    expect(next.company.phone).toBe(DEFAULT_SETTINGS.company.phone)
    expect(next.specialItems.kort).toEqual({ name: 'Kort', price: 30 })
    expect(next.specialItems.frakt).toEqual(DEFAULT_SETTINGS.specialItems.frakt)
  })

  it('distinguishes "not provided" from an explicit null defaultPrinter', () => {
    const withPrinter = mergeSettings(DEFAULT_SETTINGS, {
      defaultPrinter: 'HP LaserJet',
    })
    expect(withPrinter.defaultPrinter).toBe('HP LaserJet')
    // Omitting the key keeps the current value…
    expect(mergeSettings(withPrinter, {}).defaultPrinter).toBe('HP LaserJet')
    // …while explicit null clears it.
    expect(
      mergeSettings(withPrinter, { defaultPrinter: null }).defaultPrinter,
    ).toBeNull()
  })

  it('replaces quickSelect arrays instead of merging them', () => {
    const current = mergeSettings(DEFAULT_SETTINGS, {
      quickSelect: { cardSignatures: ['Hilsen A', 'Hilsen B'] },
    })
    const next = mergeSettings(current, {
      quickSelect: { cardSignatures: ['Hilsen C'] },
    })
    expect(next.quickSelect.cardSignatures).toEqual(['Hilsen C'])
    expect(next.quickSelect.instructionSuggestions).toEqual([])
  })
})

describe('customerTypeDefaults', () => {
  it('migrates older settings without the field to private everywhere', () => {
    const migrated = migrateSettings({ rowsPerPage: 25 })
    expect(migrated.customerTypeDefaults).toEqual({
      global: 'private',
      perLocation: false,
      locations: {
        senderForm: 'private',
        recipientForm: 'private',
        customersPage: 'private',
      },
    })
  })

  it('deep-merges partial updates to one location', () => {
    const merged = mergeSettings(DEFAULT_SETTINGS, {
      customerTypeDefaults: { locations: { customersPage: 'business' } },
    })
    expect(merged.customerTypeDefaults.locations).toEqual({
      senderForm: 'private',
      recipientForm: 'private',
      customersPage: 'business',
    })
    expect(merged.customerTypeDefaults.global).toBe('private')
  })

  it('resolves the global default unless perLocation is on', () => {
    const global = mergeSettings(DEFAULT_SETTINGS, {
      customerTypeDefaults: {
        global: 'business',
        locations: { senderForm: 'private' },
      },
    })
    expect(resolveCustomerTypeDefault(global, 'senderForm')).toBe('business')

    const perLocation = mergeSettings(global, {
      customerTypeDefaults: { perLocation: true },
    })
    expect(resolveCustomerTypeDefault(perLocation, 'senderForm')).toBe(
      'private',
    )
  })
})
