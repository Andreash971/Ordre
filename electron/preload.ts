import { contextBridge, ipcRenderer } from 'electron'

const api = {
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    search: (q: string) => ipcRenderer.invoke('customers:search', q),
    searchByPhone: (q: string) =>
      ipcRenderer.invoke('customers:searchByPhone', q),
    searchByBusiness: (q: string) =>
      ipcRenderer.invoke('customers:searchByBusiness', q),
    insert: (data: unknown) => ipcRenderer.invoke('customers:insert', data),
    update: (data: unknown) => ipcRenderer.invoke('customers:update', data),
    delete: (id: number) => ipcRenderer.invoke('customers:delete', id),
  },
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    search: (q: string) => ipcRenderer.invoke('products:search', q),
    insert: (data: unknown) => ipcRenderer.invoke('products:insert', data),
    update: (data: unknown) => ipcRenderer.invoke('products:update', data),
    delete: (id: number) => ipcRenderer.invoke('products:delete', id),
  },
  bring: {
    lookupPostcode: (code: string) =>
      ipcRenderer.invoke('bring:lookupPostcode', code),
    suggestAddresses: (q: string) =>
      ipcRenderer.invoke('bring:suggestAddresses', q),
  },
  store: {
    getAll: () => ipcRenderer.invoke('store:getAll'),
    setTheme: (mode: string) => ipcRenderer.invoke('store:setTheme', mode),
    setSettings: (partial: unknown) =>
      ipcRenderer.invoke('store:setSettings', partial),
    setOrders: (orders: unknown) =>
      ipcRenderer.invoke('store:setOrders', orders),
    clearOrders: () => ipcRenderer.invoke('store:clearOrders'),
    setOnboardingCompleted: (completed: boolean) =>
      ipcRenderer.invoke('store:setOnboardingCompleted', completed),
  },
  printer: {
    list: () => ipcRenderer.invoke('printer:list'),
    discover: () => ipcRenderer.invoke('printer:discover'),
    print: (pdfBytes: ArrayBuffer, printerName?: string) =>
      ipcRenderer.invoke('printer:print', pdfBytes, printerName),
  },
  pdf: {
    open: (pdfBytes: ArrayBuffer): Promise<string> =>
      ipcRenderer.invoke('pdf:open', pdfBytes),
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
