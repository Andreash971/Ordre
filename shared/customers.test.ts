import { describe, expect, it } from 'vitest'

import { customerSchema } from './customers'
import { contactSchema } from './contacts'

describe('customerSchema', () => {
  it('defaults type to private so pre-split payloads stay valid', () => {
    const parsed = customerSchema.parse({ name: 'Ola Nordmann' })
    expect(parsed.type).toBe('private')
  })

  it('accepts business customers', () => {
    const parsed = customerSchema.parse({
      type: 'business',
      name: 'Blomster AS',
      company: 'Blomster AS',
    })
    expect(parsed.type).toBe('business')
  })

  it('rejects unknown types', () => {
    expect(() => customerSchema.parse({ type: 'org', name: 'X' })).toThrow()
  })
})

describe('contactSchema', () => {
  it('requires a positive customerId', () => {
    expect(() => contactSchema.parse({ name: 'Kari' })).toThrow()
    expect(() => contactSchema.parse({ customerId: 0, name: 'Kari' })).toThrow()
    expect(
      contactSchema.parse({ customerId: 1, name: 'Kari', phone: '99887766' }),
    ).toMatchObject({ customerId: 1, name: 'Kari' })
  })

  it('caps field lengths like the customer schema', () => {
    expect(() =>
      contactSchema.parse({ customerId: 1, name: 'x'.repeat(51) }),
    ).toThrow()
    expect(() =>
      contactSchema.parse({
        customerId: 1,
        name: 'Kari',
        phone: '1'.repeat(16),
      }),
    ).toThrow()
  })
})
