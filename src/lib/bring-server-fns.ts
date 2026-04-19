import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'

const postcodeSchema = z.string().regex(/^\d{4}$/)

const bringResponseSchema = z.object({
  postal_codes: z.array(z.object({ city: z.string() })),
})

export const lookupPostcode = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => postcodeSchema.parse(data))
  .handler(async ({ data: postcode }) => {
    const uid = process.env.BRING_UID
    const key = process.env.BRING_API_KEY
    if (!uid || !key) throw new Error('Bring API credentials missing')

    const res = await fetch(
      `https://api.bring.com/address/api/no/postal-codes/${postcode}`,
      {
        headers: {
          Accept: 'application/json',
          'X-Mybring-API-Uid': uid,
          'X-Mybring-API-Key': key,
        },
      },
    )
    if (!res.ok) return { city: null as string | null }
    const parsed = bringResponseSchema.safeParse(await res.json())
    const city = parsed.success
      ? (parsed.data.postal_codes[0]?.city ?? null)
      : null
    return { city }
  })
