/**
 * Bring address-lookup IPC contract shared by the electron main process and
 * the renderer. (Schemas validating Bring's own API responses stay in
 * electron/ipc/bring.ts — they never cross the process boundary.)
 */
export type AddressSuggestion = {
  id: number
  street_name: string
  house_number: number | null
  letter: string | null
  postal_code: string
  city: string
  municipality: string | null
}
