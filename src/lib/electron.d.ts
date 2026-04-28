import type { Customer, Product, AddressSuggestion } from './api-types'

declare global {
  interface Window {
    electronAPI: {
      customers: {
        getAll: () => Promise<Array<Customer>>
        search: (q: string) => Promise<Array<Customer>>
        searchByPhone: (q: string) => Promise<Array<Customer>>
        searchByBusiness: (q: string) => Promise<Array<Customer>>
        insert: (data: unknown) => Promise<{ id: number }>
        update: (data: unknown) => Promise<void>
        delete: (id: number) => Promise<void>
      }
      products: {
        getAll: () => Promise<Array<Product>>
        search: (q: string) => Promise<Array<Product>>
        insert: (data: unknown) => Promise<Product>
        update: (data: unknown) => Promise<void>
        delete: (id: number) => Promise<void>
      }
      bring: {
        lookupPostcode: (code: string) => Promise<{ city: string | null }>
        suggestAddresses: (q: string) => Promise<Array<AddressSuggestion>>
      }
    }
  }
}

export {}
