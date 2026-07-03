import { describe, expect, it } from 'vitest'

import { isNewerVersion } from './version'

describe('isNewerVersion', () => {
  it('compares major, minor, and patch in order', () => {
    expect(isNewerVersion('2.0.0', '1.9.9')).toBe(true)
    expect(isNewerVersion('1.2.0', '1.1.9')).toBe(true)
    expect(isNewerVersion('1.1.2', '1.1.1')).toBe(true)
    expect(isNewerVersion('1.1.1', '1.1.2')).toBe(false)
    expect(isNewerVersion('1.1.1', '1.1.1')).toBe(false)
  })

  it('ignores pre-release suffixes', () => {
    expect(isNewerVersion('1.2.0-beta.1', '1.1.9')).toBe(true)
    expect(isNewerVersion('1.1.0-beta.2', '1.1.0')).toBe(false)
  })

  it('treats missing segments as zero', () => {
    expect(isNewerVersion('1.2', '1.1.9')).toBe(true)
    expect(isNewerVersion('1', '1.0.0')).toBe(false)
  })
})
