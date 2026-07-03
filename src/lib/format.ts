/** Shared formatting helpers — use these instead of local Intl instances. */

const nokFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Format an amount as Norwegian kroner, e.g. `kr 1 250`. */
export function formatNok(amount: number): string {
  return nokFormatter.format(amount)
}

/** Local-timezone ISO date string (YYYY-MM-DD). Defaults to today. */
export function toIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
