import { ipcMain, utilityProcess } from 'electron'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'

type SidecarMessage = {
  id: string
  ok: boolean
  result?: unknown
  error?: string
}

let sidecar: Electron.UtilityProcess | null = null
const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: Error) => void }
>()

export function spawnPrinterSidecar() {
  const sidecarPath = path.join(__dirname, '..', 'sidecar', 'printer.js')
  sidecar = utilityProcess.fork(sidecarPath)

  sidecar.on('message', (msg: SidecarMessage) => {
    const handler = pending.get(msg.id)
    if (!handler) return
    pending.delete(msg.id)
    if (msg.ok) handler.resolve(msg.result)
    else handler.reject(new Error(msg.error ?? 'Unknown error'))
  })

  sidecar.on('exit', (code) => {
    console.log(`[printer-sidecar] exited with code ${code}`)
    sidecar = null
  })
}

export function killPrinterSidecar() {
  sidecar?.kill()
  sidecar = null
}

function relay(msg: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!sidecar) {
      reject(new Error('Printer sidecar not running'))
      return
    }
    const id = randomUUID()
    pending.set(id, { resolve, reject })
    sidecar.postMessage({ id, ...msg })
  })
}

export function registerPrinterHandlers() {
  ipcMain.handle('printer:list', () => relay({ type: 'list-printers' }))

  ipcMain.handle('printer:discover', () =>
    relay({ type: 'discover-network', timeoutMs: 5000 }),
  )

  ipcMain.handle(
    'printer:print',
    async (_e, rawBytes: unknown, printerName?: string) => {
      const buf =
        rawBytes instanceof Buffer
          ? rawBytes
          : Buffer.from(rawBytes as ArrayBuffer)

      const filePath = path.join(os.tmpdir(), `ordre-${Date.now()}.pdf`)
      try {
        fs.writeFileSync(filePath, buf)
        await relay({ type: 'print-pdf', filePath, printerName })
      } finally {
        try {
          fs.unlinkSync(filePath)
        } catch {
          // ignore cleanup errors
        }
      }
    },
  )
}
