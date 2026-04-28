import type { AddressSuggestion } from './api-types'

export type { AddressSuggestion }

const api = () => window.electronAPI.bring

export const lookupPostcode = ({
  data,
}: {
  data: string
}): Promise<{ city: string | null }> => api().lookupPostcode(data)

export const suggestAddresses = ({
  data,
}: {
  data: string
}): Promise<Array<AddressSuggestion>> => api().suggestAddresses(data)
