import { ipcMain } from 'electron'
import * as z from 'zod'

import { getStore } from '../store'

const postcodeSchema = z.string().regex(/^\d{4}$/)

const bringResponseSchema = z.object({
  postal_codes: z.array(z.object({ city: z.string() })),
})

const addressItemSchema = z.object({
  address_id: z.string(),
  street_name: z.string(),
  house_number: z.number().nullable().optional(),
  letter: z.string().nullable().optional(),
  postal_code: z.string(),
  city: z.string(),
  county: z.string().nullable().optional(),
  municipality: z.string().nullable().optional(),
})

const suggestionsResponseSchema = z.object({
  addresses: z.array(addressItemSchema),
  navigation: z.object({ next: z.string().nullable().optional() }).optional(),
})

const MAX_PAGES = 10
const TARGET = 5

async function getCredentials() {
  const store = await getStore()
  const { uid, apiKey } = store.get('settings').bringApi
  if (!uid || !apiKey) throw new Error('Bring API credentials missing')
  return { uid, key: apiKey }
}

export function registerBringHandlers() {
  ipcMain.handle('bring:lookupPostcode', async (_e, raw: unknown) => {
    const postcode = postcodeSchema.parse(raw)
    const { uid, key } = await getCredentials()

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

  ipcMain.handle('bring:suggestAddresses', async (_e, raw: unknown) => {
    const query = z.string().min(1).parse(raw)
    const { uid, key } = await getCredentials()

    const headers = {
      Accept: 'application/json',
      'X-Mybring-API-Uid': uid,
      'X-Mybring-API-Key': key,
    }

    let url = `https://api.bring.com/address/api/no/addresses/suggestions?q=${encodeURIComponent(query)}`
    const matches: Array<z.infer<typeof addressItemSchema>> = []

    for (let page = 0; page < MAX_PAGES && matches.length < TARGET; page++) {
      const res = await fetch(url, { headers })
      if (!res.ok) break
      const parsed = suggestionsResponseSchema.safeParse(await res.json())
      if (!parsed.success) break

      for (const a of parsed.data.addresses) {
        if (a.county === 'Trøndelag') matches.push(a)
        if (matches.length >= TARGET) break
      }

      const nextUrl = parsed.data.navigation?.next
      if (!nextUrl) break
      url = nextUrl
    }

    return matches.slice(0, TARGET).map((a) => ({
      id: Number(a.address_id),
      street_name: a.street_name,
      house_number: a.house_number ?? null,
      letter: a.letter ?? null,
      postal_code: a.postal_code,
      city: a.city,
      municipality: a.municipality ?? null,
    }))
  })
}
