import { describe, expect, it } from 'vitest'

import { getSpecialKeyForItem, isSpecial } from './special-items'

describe('special-items legacy name mapping', () => {
  it('recognizes items by explicit specialKey', () => {
    expect(getSpecialKeyForItem({ specialKey: 'kort', name: 'Whatever' })).toBe(
      'kort',
    )
    expect(isSpecial({ specialKey: 'frakt', name: 'X' })).toBe(true)
  })

  it('maps default names for archived items without a specialKey', () => {
    expect(getSpecialKeyForItem({ name: 'Frakt' })).toBe('frakt')
    expect(getSpecialKeyForItem({ name: 'Leveringstid' })).toBe('leveringstid')
    expect(getSpecialKeyForItem({ name: 'Kort' })).toBe('kort')
  })

  it('maps the pre-rename "Frakt Tidspunktstillegg" to leveringstid', () => {
    expect(getSpecialKeyForItem({ name: 'Frakt Tidspunktstillegg' })).toBe(
      'leveringstid',
    )
    expect(isSpecial({ name: 'Frakt Tidspunktstillegg' })).toBe(true)
  })

  it('treats ordinary products as non-special', () => {
    expect(getSpecialKeyForItem({ name: 'Bukett' })).toBeUndefined()
    expect(isSpecial({ name: 'Bukett' })).toBe(false)
  })
})
