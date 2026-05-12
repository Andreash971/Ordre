import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Bonjour } from 'bonjour-service'
import type { Service } from 'bonjour-service'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrinterInfo = { name: string; isDefault: boolean }

type SidecarRequest =
  | { id: string; type: 'list-printers' }
  | { id: string; type: 'discover-network'; timeoutMs: number }
  | { id: string; type: 'print-pdf'; filePath: string; printerName?: string }

type SidecarResponse =
  | { id: string; ok: true; result: unknown }
  | { id: string; ok: false; error: string }

// ---------------------------------------------------------------------------
// Platform helpers
// ---------------------------------------------------------------------------

async function listPrinters(): Promise<PrinterInfo[]> {
  if (os.platform() === 'win32') {
    const { getPrinters, getDefaultPrinter } = await import('pdf-to-printer')
    const [all, def] = await Promise.all([getPrinters(), getDefaultPrinter()])
    return all.map((p) => ({ name: p.name, isDefault: p.name === def?.name }))
  }

  // macOS / Linux — CUPS
  let defaultPrinter = ''
  try {
    const { stdout } = await execFileAsync('lpstat', ['-d'])
    const m = stdout.match(/system default destination:\s*(.+)/)
    if (m) defaultPrinter = m[1].trim()
  } catch {
    // no CUPS default configured
  }

  try {
    const { stdout } = await execFileAsync('lpstat', ['-a'])
    return stdout
      .split('\n')
      .map((line) => line.split(' ')[0])
      .filter(Boolean)
      .map((name) => ({ name, isDefault: name === defaultPrinter }))
  } catch {
    return []
  }
}

async function printPdf(filePath: string, printerName?: string): Promise<void> {
  if (os.platform() === 'win32') {
    const { print } = await import('pdf-to-printer')
    await print(filePath, printerName ? { printer: printerName } : undefined)
    return
  }

  // macOS / Linux — CUPS lp
  const args: string[] = []
  if (printerName) args.push('-d', printerName)
  args.push(filePath)
  await execFileAsync('lp', args)
}

// ---------------------------------------------------------------------------
// IPC via utilityProcess parentPort
// ---------------------------------------------------------------------------

const parentPort = (
  process as unknown as {
    parentPort: {
      on(event: 'message', cb: (event: { data: unknown }) => void): void
      postMessage(data: unknown): void
    }
  }
).parentPort

function send(response: SidecarResponse) {
  parentPort.postMessage(response)
}

parentPort.on('message', async ({ data: raw }) => {
  const msg = raw as SidecarRequest
  const { id, type } = msg

  try {
    if (type === 'list-printers') {
      const printers = await listPrinters()
      send({ id, ok: true, result: printers })
    } else if (type === 'discover-network') {
      const bonjour = new Bonjour()
      const found: Array<{ name: string; host: string; port: number; addresses: string[] }> = []

      const collect = (service: Service) => {
        if (!found.some((p) => p.name === service.name)) {
          found.push({
            name: service.name,
            host: service.host,
            port: service.port,
            addresses: service.addresses ?? [],
          })
        }
      }

      const b1 = bonjour.find({ type: 'ipp' }, collect)
      const b2 = bonjour.find({ type: 'pdl-datastream' }, collect)

      await new Promise<void>((resolve) => setTimeout(resolve, msg.timeoutMs))

      b1.stop()
      b2.stop()
      bonjour.destroy()

      send({ id, ok: true, result: found })
    } else if (type === 'print-pdf') {
      await printPdf(msg.filePath, msg.printerName)
      send({ id, ok: true, result: null })
    } else {
      send({ id, ok: false, error: `Unknown type: ${(msg as { type: string }).type}` })
    }
  } catch (err) {
    send({ id, ok: false, error: err instanceof Error ? err.message : String(err) })
  }
})
