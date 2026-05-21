import type { Customer, Product, AddressSuggestion } from './api-types'
import type { AppSettings } from './settings'
import type { ThemeMode } from './theme'
import type { StoredOrder } from './order-utils'

export interface Printer {
  name: string
  isDefault: boolean
}

export interface DiscoveredPrinter {
  name: string
  host: string
  port: number
  addresses: string[]
}

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
      store: {
        getAll: () => Promise<{
          theme: ThemeMode
          settings: AppSettings
          orders: Record<string, StoredOrder>
          onboardingCompleted: boolean
        }>
        setTheme: (mode: ThemeMode) => Promise<void>
        setSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
        setOrders: (orders: Record<string, StoredOrder>) => Promise<void>
        clearOrders: () => Promise<void>
        setOnboardingCompleted: (completed: boolean) => Promise<void>
      }
      printer: {
        list: () => Promise<Printer[]>
        discover: () => Promise<DiscoveredPrinter[]>
        print: (pdfBytes: ArrayBuffer, printerName?: string) => Promise<void>
      }
      pdf: {
        open: (pdfBytes: ArrayBuffer) => Promise<string>
      }
    }
  }
}

export {}
