import {
  DEFAULT_SPECIAL_ITEMS,
  SPECIAL_ITEM_KEYS,
  getStoredSettings,
} from './settings'
import type { SpecialItem, SpecialItemKey } from './settings'

const LEGACY_NAME_TO_KEY: Record<string, SpecialItemKey> = {
  [DEFAULT_SPECIAL_ITEMS.frakt.name]: 'frakt',
  [DEFAULT_SPECIAL_ITEMS.leveringstid.name]: 'leveringstid',
  [DEFAULT_SPECIAL_ITEMS.kort.name]: 'kort',
  // Historical name from before the rename to "Leveringstid".
  // Remove on or after 2026-09-28 once archived orders predating the rename are no longer relevant.
  'Frakt Tidspunktstillegg': 'leveringstid',
}

export const LEGACY_SPECIAL_NAMES = new Set(Object.keys(LEGACY_NAME_TO_KEY))

export function isSpecial(item: {
  specialKey?: SpecialItemKey
  name: string
}): boolean {
  return item.specialKey != null || LEGACY_SPECIAL_NAMES.has(item.name)
}

export function getSpecialKeyForItem(item: {
  specialKey?: SpecialItemKey
  name: string
}): SpecialItemKey | undefined {
  return item.specialKey ?? LEGACY_NAME_TO_KEY[item.name]
}

export function getCurrentSpecialItems(): Record<SpecialItemKey, SpecialItem> {
  return getStoredSettings().specialItems
}

export const TOGGLE_DRIVEN_SPECIAL_KEYS = new Set<SpecialItemKey>([
  'leveringstid',
  'kort',
])

export function specialItemLabel(key: SpecialItemKey): string {
  switch (key) {
    case 'frakt':
      return 'Frakt'
    case 'leveringstid':
      return 'Leveringstid'
    case 'kort':
      return 'Kort'
  }
}

export { SPECIAL_ITEM_KEYS }
export type { SpecialItem, SpecialItemKey }
