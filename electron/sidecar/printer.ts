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

export type DiscoveredPrinter = {
  name: string
  host?: string
  port?: number
  addresses?: string[]
  source: 'mdns' | 'configured' | 'wsd'
}

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

async function runPowerShell(command: string): Promise<string> {
  // Force PowerShell to write stdout as UTF-8 so non-ASCII characters in
  // printer names (e.g. typographic apostrophe U+2019 in AirPrint shares,
  // Norwegian æ/ø/å) survive the trip back to Node. Without this, the OEM
  // console code page (cp850/cp1252) silently transliterates them and we
  // hand the wrong name to SumatraPDF, which then can't OpenPrinter().
  const prelude =
    '[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();' +
    '$OutputEncoding=[System.Text.UTF8Encoding]::new();'
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', prelude + command],
    { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' },
  )
  return stdout
}

function parseJsonOutput<T>(stdout: string): T[] {
  const trimmed = stdout.trim()
  if (!trimmed) return []
  const parsed = JSON.parse(trimmed) as T | T[]
  return Array.isArray(parsed) ? parsed : [parsed]
}

async function listPrinters(): Promise<PrinterInfo[]> {
  if (os.platform() === 'win32') {
    // Use Get-Printer (PrintManagement module) instead of Get-CimInstance
    // Win32_Printer — the latter relies on the root\cimv2 WMI provider which
    // is broken on some Windows installations (HRESULT 0x80041001).
    // Default printer comes from the registry, also avoiding WMI.
    const cmd = [
      "$d = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Windows' -Name Device -ErrorAction SilentlyContinue).Device;",
      "if ($d) { $d = $d.Split(',')[0] };",
      "Get-Printer | Select-Object Name, @{N='Default';E={$_.Name -eq $d}} | ConvertTo-Json -Compress",
    ].join(' ')
    let stdout: string
    try {
      stdout = await runPowerShell(cmd)
    } catch (err) {
      const stderr =
        (err as { stderr?: string }).stderr ??
        (err instanceof Error ? err.message : String(err))
      if (
        /spooler service is not reachable|0x800706ba|RPC server is unavailable/i.test(
          stderr,
        )
      ) {
        throw new Error(
          'Utskriftstjenesten (Print Spooler) kjører ikke. Start den fra Tjenester (services.msc) eller kjør "Start-Service Spooler" i PowerShell som administrator.',
        )
      }
      throw new Error(stderr.trim().split('\n')[0] || 'Ukjent feil')
    }
    const rows = parseJsonOutput<{ Name: string; Default: boolean }>(stdout)
    return rows
      .filter((r) => !!r.Name)
      .map((r) => ({ name: r.Name, isDefault: r.Default === true }))
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
// Network discovery
// ---------------------------------------------------------------------------

async function discoverMdns(timeoutMs: number): Promise<DiscoveredPrinter[]> {
  const bonjour = new Bonjour()
  const found: DiscoveredPrinter[] = []
  const seen = new Set<string>()

  const collect = (service: Service) => {
    const key = `${service.host}:${service.port}|${service.name}`
    if (seen.has(key)) return
    seen.add(key)

    const txt = service.txt as Record<string, string> | undefined
    const friendly = txt?.ty || service.name

    found.push({
      name: friendly,
      host: service.host,
      port: service.port,
      addresses: service.addresses ?? [],
      source: 'mdns',
    })
  }

  const browsers = [
    bonjour.find({ type: 'ipp' }),
    bonjour.find({ type: 'ipps' }),
    bonjour.find({ type: 'pdl-datastream' }),
  ]
  for (const b of browsers) b.on('up', collect)

  await new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))

  for (const b of browsers) {
    try {
      b.stop()
    } catch {
      // ignore browser-stop errors
    }
  }
  try {
    bonjour.destroy()
  } catch {
    // ignore destroy errors
  }

  return found
}

type WinPrinterRow = { Name: string; PortName: string }
type WinPortRow = {
  Name: string
  PrinterHostAddress?: string | null
  PortNumber?: number | null
}

async function discoverWindowsConfigured(): Promise<DiscoveredPrinter[]> {
  const printersCmd =
    "Get-Printer | Where-Object { $_.PortName -match '^(IP_|WSD-|\\d+\\.\\d+\\.\\d+\\.\\d+)' } | " +
    'Select-Object Name, PortName | ConvertTo-Json -Compress'
  const portsCmd =
    'Get-PrinterPort | Select-Object Name, PrinterHostAddress, PortNumber | ' +
    'ConvertTo-Json -Compress'

  const [printersOut, portsOut] = await Promise.all([
    runPowerShell(printersCmd).catch(() => ''),
    runPowerShell(portsCmd).catch(() => ''),
  ])

  const printers = parseJsonOutput<WinPrinterRow>(printersOut)
  const ports = parseJsonOutput<WinPortRow>(portsOut)
  const portMap = new Map(ports.map((p) => [p.Name, p]))

  return printers
    .filter((p) => !!p.Name)
    .map((p) => {
      const port = portMap.get(p.PortName)
      const host = port?.PrinterHostAddress ?? undefined
      return {
        name: p.Name,
        host,
        port: port?.PortNumber ?? undefined,
        addresses: host ? [host] : [],
        source: 'configured' as const,
      }
    })
}

async function discoverWindowsWsd(): Promise<DiscoveredPrinter[]> {
  // MSFT_WSDPrinter is not available on all Windows editions; treat any
  // failure as "no WSD results" rather than surfacing an error.
  const cmd =
    'Get-WmiObject -Namespace root\\standardcimv2 -Class MSFT_WSDPrinter -ErrorAction Stop | ' +
    'Select-Object FriendlyName, IPAddress | ConvertTo-Json -Compress'
  try {
    const stdout = await runPowerShell(cmd)
    const rows = parseJsonOutput<{
      FriendlyName?: string
      IPAddress?: string | string[]
    }>(stdout)
    return rows
      .filter((r) => !!r.FriendlyName)
      .map((r) => {
        const addrs = Array.isArray(r.IPAddress)
          ? r.IPAddress
          : r.IPAddress
            ? [r.IPAddress]
            : []
        return {
          name: r.FriendlyName as string,
          host: addrs[0],
          addresses: addrs,
          source: 'wsd' as const,
        }
      })
  } catch {
    return []
  }
}

async function discoverNetwork(
  timeoutMs: number,
): Promise<DiscoveredPrinter[]> {
  const tasks: Array<Promise<DiscoveredPrinter[]>> = [discoverMdns(timeoutMs)]

  if (os.platform() === 'win32') {
    tasks.push(discoverWindowsConfigured())
    tasks.push(discoverWindowsWsd())
  }

  const results = await Promise.all(tasks)
  const merged: DiscoveredPrinter[] = []
  const seen = new Set<string>()

  for (const list of results) {
    for (const p of list) {
      const hostKey = p.host && p.port ? `${p.host}:${p.port}` : ''
      const key = hostKey || p.name
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(p)
    }
  }

  return merged
}

// ---------------------------------------------------------------------------
// IPC via utilityProcess parentPort
// ---------------------------------------------------------------------------

const parentPort = (
  process as unknown as {
    parentPort: {
      on: (event: 'message', cb: (event: { data: unknown }) => void) => void
      postMessage: (data: unknown) => void
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
      const result = await discoverNetwork(msg.timeoutMs)
      send({ id, ok: true, result })
    } else {
      await printPdf(msg.filePath, msg.printerName)
      send({ id, ok: true, result: null })
    }
  } catch (err) {
    console.error('[printer-sidecar]', type, err)
    send({
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
})
