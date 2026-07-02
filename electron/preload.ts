import { contextBridge, ipcRenderer } from 'electron'
import type {
  Customer,
  CustomerSuggestion,
  InsertCustomerInput,
  UpdateCustomerInput,
} from '../shared/customers'
import type {
  InsertProductInput,
  Product,
  UpdateProductInput,
} from '../shared/products'
import type { AddressSuggestion } from '../shared/bring'
import type {
  AppSettings,
  PartialSettings,
  ThemeMode,
} from '../shared/settings'
import type { StoredOrder } from '../shared/orders'
import type { DiscoveredPrinter, PrinterInfo } from '../shared/printing'
import type { PendingUpdate } from '../shared/updates'

const api = {
  customers: {
    getAll: (): Promise<Array<Customer>> =>
      ipcRenderer.invoke('customers:getAll'),
    search: (q: string): Promise<Array<CustomerSuggestion>> =>
      ipcRenderer.invoke('customers:search', q),
    searchByPhone: (q: string): Promise<Array<CustomerSuggestion>> =>
      ipcRenderer.invoke('customers:searchByPhone', q),
    searchByBusiness: (q: string): Promise<Array<CustomerSuggestion>> =>
      ipcRenderer.invoke('customers:searchByBusiness', q),
    insert: (data: InsertCustomerInput): Promise<{ id: number }> =>
      ipcRenderer.invoke('customers:insert', data),
    update: (data: UpdateCustomerInput): Promise<void> =>
      ipcRenderer.invoke('customers:update', data),
    delete: (id: number): Promise<void> =>
      ipcRenderer.invoke('customers:delete', id),
  },
  products: {
    getAll: (): Promise<Array<Product>> =>
      ipcRenderer.invoke('products:getAll'),
    search: (q: string): Promise<Array<Product>> =>
      ipcRenderer.invoke('products:search', q),
    insert: (data: InsertProductInput): Promise<Product> =>
      ipcRenderer.invoke('products:insert', data),
    update: (data: UpdateProductInput): Promise<void> =>
      ipcRenderer.invoke('products:update', data),
    delete: (id: number): Promise<void> =>
      ipcRenderer.invoke('products:delete', id),
  },
  bring: {
    lookupPostcode: (code: string): Promise<{ city: string | null }> =>
      ipcRenderer.invoke('bring:lookupPostcode', code),
    suggestAddresses: (q: string): Promise<Array<AddressSuggestion>> =>
      ipcRenderer.invoke('bring:suggestAddresses', q),
  },
  store: {
    getAll: (): Promise<{
      theme: ThemeMode
      settings: AppSettings
      orders: Record<string, StoredOrder>
      onboardingCompleted: boolean
    }> => ipcRenderer.invoke('store:getAll'),
    setTheme: (mode: ThemeMode): Promise<void> =>
      ipcRenderer.invoke('store:setTheme', mode),
    setSettings: (partial: PartialSettings): Promise<AppSettings> =>
      ipcRenderer.invoke('store:setSettings', partial),
    setOrders: (orders: Record<string, StoredOrder>): Promise<void> =>
      ipcRenderer.invoke('store:setOrders', orders),
    clearOrders: (): Promise<void> => ipcRenderer.invoke('store:clearOrders'),
    setOnboardingCompleted: (completed: boolean): Promise<void> =>
      ipcRenderer.invoke('store:setOnboardingCompleted', completed),
  },
  printer: {
    list: (): Promise<Array<PrinterInfo>> => ipcRenderer.invoke('printer:list'),
    discover: (): Promise<Array<DiscoveredPrinter>> =>
      ipcRenderer.invoke('printer:discover'),
    print: (pdfBytes: ArrayBuffer, printerName?: string): Promise<void> =>
      ipcRenderer.invoke('printer:print', pdfBytes, printerName),
  },
  pdf: {
    open: (pdfBytes: ArrayBuffer): Promise<string> =>
      ipcRenderer.invoke('pdf:open', pdfBytes),
  },
  update: {
    getPending: (): Promise<PendingUpdate | null> =>
      ipcRenderer.invoke('update:getPending'),
    install: (): Promise<void> => ipcRenderer.invoke('update:install'),
    onAvailable: (cb: (info: PendingUpdate) => void) => {
      const listener = (_e: unknown, info: PendingUpdate) => cb(info)
      ipcRenderer.on('update:available', listener)
      return () => {
        ipcRenderer.removeListener('update:available', listener)
      }
    },
  },
  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke('shell:openExternal', url),
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
