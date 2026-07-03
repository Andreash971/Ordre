/**
 * Printer IPC contract shared by the printer sidecar, the electron main
 * process, and the renderer.
 */
export type PrinterInfo = { name: string; isDefault: boolean }

export type DiscoveredPrinter = {
  name: string
  host?: string
  port?: number
  addresses?: string[]
  source: 'mdns' | 'configured' | 'wsd'
}
