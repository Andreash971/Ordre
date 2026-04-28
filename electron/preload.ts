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
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
