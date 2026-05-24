import os from 'node:os'
import fs from 'node:fs'
import dgram from 'node:dgram'
import readline from 'node:readline'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { Bonjour } from 'bonjour-service'
import type { Service } from 'bonjour-service'

// dns-packet has no shipped types; declare the narrow surface we need.
// It's a transitive dep via bonjour-service → multicast-dns → dns-packet.
type DnsRecord = {
  name: string
  type: string
  class?: string | number
  ttl?: number
  data: unknown
}
type DnsPacket = {
  type: 'query' | 'response'
  id?: number
  flags?: number
  questions?: Array<{ name: string; type: string; class?: string | number }>
  answers?: DnsRecord[]
  authorities?: DnsRecord[]
  additionals?: DnsRecord[]
}
type DnsPacketModule = {
  encode: (pkt: DnsPacket) => Buffer
  decode: (buf: Buffer) => DnsPacket
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dnsPacket = require('dns-packet') as DnsPacketModule

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
  // Phase 1 diagnostics: log interfaces, attach error/warning listeners,
  // and emit a per-browser hit counter at the end. We previously had zero
  // visibility into why discovery returned []; on Windows with Apple's
  // Bonjour Service running, the multicast-dns socket can't share UDP/5353
  // (SO_EXCLUSIVEADDRUSE) and bind/membership errors were silently swallowed.
  const ifaces = os.networkInterfaces()
  const ifaceSummary = Object.entries(ifaces)
    .flatMap(([name, addrs]) =>
      (addrs ?? [])
        .filter((a) => a.family === 'IPv4')
        .map(
          (a) => `${name}=${a.address}${a.internal ? '(internal)' : ''}`,
        ),
    )
    .join(' ')
  console.log(`[printer-sidecar mdns] interfaces: ${ifaceSummary || 'none'}`)

  const bonjour = new Bonjour(undefined, (err: unknown) => {
    const e = err as { code?: string; message?: string }
    console.error(
      `[printer-sidecar mdns] bonjour error: code=${e?.code ?? 'unknown'} msg=${e?.message ?? String(err)}`,
    )
  })
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

  // _printer._tcp is LPD — Apple Printer Simulator broadcasts this even when
  // IPP/IPPS aren't enabled, so include it for completeness on the fallback.
  const types = ['ipp', 'ipps', 'pdl-datastream', 'printer'] as const
  const counts: Record<string, number> = Object.fromEntries(
    types.map((t) => [t, 0]),
  )
  const browsers = types.map((type) => {
    const browser = bonjour.find({ type })
    browser.on('up', (svc: Service) => {
      counts[type]++
      collect(svc)
    })
    browser.on('error', (err: unknown) => {
      const e = err as { code?: string; message?: string }
      console.error(
        `[printer-sidecar mdns] browser ${type} error: code=${e?.code ?? 'unknown'} msg=${e?.message ?? String(err)}`,
      )
    })
    return browser
  })

  const startedAt = Date.now()
  await new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))
  const elapsed = Date.now() - startedAt

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

  const summary = types.map((t) => `${t}=${counts[t]}`).join(' ')
  console.log(
    `[printer-sidecar mdns] ${summary} unique=${found.length} duration=${elapsed}ms`,
  )

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

// ---------------------------------------------------------------------------
// Windows mDNS via Apple's dns-sd.exe
//
// When Apple's "Bonjour Service" (mDNSResponder) is running on Windows, it
// holds UDP/5353 with SO_EXCLUSIVEADDRUSE. Our in-process bonjour-service
// socket can still call bind() successfully (it sets SO_REUSEADDR) but the
// kernel routes multicast packets only to the exclusive owner — so we
// silently receive nothing. dns-sd.exe ships with Bonjour and talks to
// mDNSResponder over its IPC API instead of opening a socket, so it works
// even when our socket can't. Chrome and other Windows apps use this path.
// ---------------------------------------------------------------------------

const DNS_SD_PATHS = [
  'C:\\Program Files\\Bonjour\\dns-sd.exe',
  'C:\\Program Files (x86)\\Bonjour\\dns-sd.exe',
]

function findDnsSd(): string | null {
  for (const p of DNS_SD_PATHS) {
    try {
      if (fs.existsSync(p)) return p
    } catch {
      // ignore stat errors
    }
  }
  return null
}

type BrowseHit = { type: string; instance: string }

// Run `dns-sd -B _<type>._tcp local.` for the given timeout, invoking onAdd
// for each "Add" row in the output.
function browseService(
  dnsSdPath: string,
  type: string,
  timeoutMs: number,
  onAdd: (hit: BrowseHit) => void,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const child = spawn(dnsSdPath, ['-B', `_${type}._tcp`, 'local.'], {
      windowsHide: true,
    })
    const rl = readline.createInterface({ input: child.stdout })
    rl.on('line', (line) => {
      // Columns: Timestamp  A/R  Flags  if  Domain  ServiceType  InstanceName
      // The instance name can contain spaces, so capture the rest of the line.
      const m = line.match(
        /^\s*\S+\s+Add\s+\d+\s+\d+\s+\S+\s+\S+\s+(.+?)\s*$/,
      )
      if (m) onAdd({ type, instance: m[1] })
    })
    const timer = setTimeout(() => {
      try {
        child.kill()
      } catch {
        // ignore kill errors
      }
    }, timeoutMs)
    child.on('close', () => {
      clearTimeout(timer)
      resolve()
    })
    child.on('error', (err) => {
      console.error(
        `[printer-sidecar dns-sd] -B ${type} spawn error: ${err.message}`,
      )
      clearTimeout(timer)
      resolve()
    })
  })
}

// Run `dns-sd -L <instance> _<type>._tcp local.` to resolve host/port/ty.
function resolveInstance(
  dnsSdPath: string,
  type: string,
  instance: string,
  timeoutMs: number,
): Promise<{ host?: string; port?: number; friendly?: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      dnsSdPath,
      ['-L', instance, `_${type}._tcp`, 'local.'],
      { windowsHide: true },
    )
    let host: string | undefined
    let port: number | undefined
    let friendly: string | undefined
    const rl = readline.createInterface({ input: child.stdout })
    rl.on('line', (line) => {
      // "<instance>._<type>._tcp.local. can be reached at HOST.:PORT (...)"
      const reach = line.match(/can be reached at\s+(\S+?)\.?:(\d+)/)
      if (reach) {
        host = reach[1].replace(/\.$/, '')
        port = parseInt(reach[2], 10)
      }
      // TXT line: space-separated key=value pairs. ty= holds the friendly
      // name and may contain spaces; capture lazily up to the next key.
      if (!friendly) {
        const ty = line.match(/\bty=(.+?)(?=\s[A-Za-z_][A-Za-z0-9_-]*=|$)/)
        if (ty) friendly = ty[1].trim()
      }
    })
    const done = () => {
      try {
        child.kill()
      } catch {
        // ignore kill errors
      }
      resolve({ host, port, friendly })
    }
    const timer = setTimeout(done, timeoutMs)
    child.on('close', () => {
      clearTimeout(timer)
      resolve({ host, port, friendly })
    })
    child.on('error', () => {
      clearTimeout(timer)
      resolve({ host, port, friendly })
    })
  })
}

async function discoverWindowsDnsSd(
  timeoutMs: number,
): Promise<DiscoveredPrinter[]> {
  const dnsSd = findDnsSd()
  if (!dnsSd) {
    console.log(
      '[printer-sidecar dns-sd] dns-sd.exe not found; falling through to bonjour-service path',
    )
    return []
  }

  const startedAt = Date.now()
  const types = ['ipp', 'ipps', 'pdl-datastream', 'printer']
  const hits = new Map<string, BrowseHit>()
  // Reserve ~1.5s of the budget for the resolve pass.
  const browseMs = Math.max(2000, timeoutMs - 1500)

  await Promise.all(
    types.map((t) =>
      browseService(dnsSd, t, browseMs, (hit) => {
        const key = `${hit.type}|${hit.instance}`
        if (!hits.has(key)) hits.set(key, hit)
      }),
    ),
  )

  const remaining = Math.max(800, timeoutMs - (Date.now() - startedAt))
  const perResolve = Math.max(
    500,
    Math.floor(remaining / Math.max(1, hits.size)),
  )

  const printers: DiscoveredPrinter[] = []
  await Promise.all(
    [...hits.values()].map(async (hit) => {
      const res = await resolveInstance(
        dnsSd,
        hit.type,
        hit.instance,
        perResolve,
      )
      printers.push({
        name: res.friendly || hit.instance,
        host: res.host,
        port: res.port,
        addresses: res.host ? [res.host] : [],
        source: 'mdns',
      })
    }),
  )

  const counts = types
    .map(
      (t) =>
        `${t}=${[...hits.values()].filter((h) => h.type === t).length}`,
    )
    .join(' ')
  console.log(
    `[printer-sidecar dns-sd] ${counts} resolved=${printers.length} duration=${Date.now() - startedAt}ms`,
  )
  return printers
}

// ---------------------------------------------------------------------------
// Unicast mDNS query (RFC 6762 §5.4 — "QU" bit)
//
// When Apple's Bonjour Service is running on Windows but dns-sd.exe isn't
// installed (the common case for users who got Bonjour bundled with iTunes
// or a printer driver), we can't bind UDP/5353 to receive multicast, and we
// can't shell out to dns-sd. The workaround: send mDNS queries from an
// ephemeral port with the "unicast response requested" (QU) bit set in the
// QCLASS field. RFC 6762-compliant responders (including mDNSResponder and
// most modern network printers) will reply unicast directly to our
// ephemeral port, bypassing the multicast bind entirely.
// ---------------------------------------------------------------------------

type MdnsQuestion = { name: string; type: 'PTR' | 'SRV' | 'TXT' | 'A' }

// Encoded length of a DNS name on the wire (no compression): for each
// label, 1 length byte + label bytes; plus a single 0 byte terminator.
function encodedNameLength(name: string): number {
  const trimmed = name.replace(/\.$/, '')
  if (!trimmed) return 1
  return (
    trimmed
      .split('.')
      .reduce((sum, l) => sum + 1 + Buffer.byteLength(l, 'utf8'), 0) + 1
  )
}

// dns-packet's encoder calls classes.toClass(class) which only accepts the
// string names 'IN'/'CS'/'CH'/'HS'/'ANY' — passing a numeric class to set
// the QU bit gets silently dropped. So encode normally with class='IN' and
// then flip the high bit of each question's QCLASS field in the buffer.
function buildQueryWithQu(questions: MdnsQuestion[]): Buffer {
  const buf = dnsPacket.encode({
    type: 'query',
    flags: 0,
    questions: questions.map((q) => ({
      name: q.name,
      type: q.type,
      class: 'IN',
    })),
  })
  // DNS header is fixed at 12 bytes. Then for each question:
  //   name (variable, length computed above) + 2 bytes QTYPE + 2 bytes QCLASS
  let offset = 12
  for (const q of questions) {
    offset += encodedNameLength(q.name)
    offset += 2 // skip QTYPE
    buf[offset] |= 0x80 // set QU bit (high bit of QCLASS high byte)
    offset += 2
  }
  return buf
}

const MDNS_PORT = 5353
const MDNS_GROUP = '224.0.0.251'

const MDNS_TYPES = [
  '_ipp._tcp.local',
  '_ipps._tcp.local',
  '_pdl-datastream._tcp.local',
  '_printer._tcp.local',
] as const

function discoverMdnsUnicast(
  timeoutMs: number,
): Promise<DiscoveredPrinter[]> {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    type Pending = {
      ptrFrom: string // which service-type PTR yielded this instance
      instance: string
      host?: string
      port?: number
      friendly?: string
      addresses: Set<string>
    }
    const byInstance = new Map<string, Pending>()
    const askedInstance = new Set<string>()
    const askedHost = new Set<string>()
    // Pending entries waiting for an A record, keyed by hostname (with or
    // without trailing dot). Used to fan A-record data back out.
    const hostsWanted = new Set<string>()

    let finished = false
    let deadlineTimer: NodeJS.Timeout | undefined
    let repeatTimer: NodeJS.Timeout | undefined

    const send = (questions: MdnsQuestion[]) => {
      if (finished || questions.length === 0) return
      try {
        const buf = buildQueryWithQu(questions)
        socket.send(buf, MDNS_PORT, MDNS_GROUP, (err) => {
          if (err) {
            console.error(
              `[printer-sidecar mdns-unicast] send error: ${err.message}`,
            )
          }
        })
      } catch (err) {
        console.error(
          `[printer-sidecar mdns-unicast] encode error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
    }

    const finish = () => {
      if (finished) return
      finished = true
      if (deadlineTimer) clearTimeout(deadlineTimer)
      if (repeatTimer) clearTimeout(repeatTimer)
      try {
        socket.close()
      } catch {
        // ignore
      }

      const result: DiscoveredPrinter[] = []
      for (const p of byInstance.values()) {
        // Display name: prefer the TXT 'ty', otherwise the leading portion
        // of the instance name before "._<type>._tcp.local".
        const dotIdx = p.instance.indexOf('._')
        const displayName =
          p.friendly ||
          (dotIdx > 0 ? p.instance.slice(0, dotIdx) : p.instance)
        result.push({
          name: displayName,
          host: p.host?.replace(/\.$/, ''),
          port: p.port,
          addresses: [...p.addresses],
          source: 'mdns',
        })
      }
      console.log(
        `[printer-sidecar mdns-unicast] discovered=${result.length} duration=${
          Date.now() - startedAt
        }ms`,
      )
      resolve(result)
    }

    socket.on('error', (err: Error) => {
      console.error(
        `[printer-sidecar mdns-unicast] socket error: ${err.message}`,
      )
      finish()
    })

    socket.on('message', (msg: Buffer) => {
      let pkt: DnsPacket
      try {
        pkt = dnsPacket.decode(msg)
      } catch {
        return
      }

      const records = [...(pkt.answers ?? []), ...(pkt.additionals ?? [])]
      const followups: MdnsQuestion[] = []

      for (const rec of records) {
        const recName = rec.name.replace(/\.$/, '')

        if (rec.type === 'PTR' && typeof rec.data === 'string') {
          // Only care about PTRs for our service types of interest.
          const matchedType = MDNS_TYPES.find((t) => recName === t)
          if (!matchedType) continue
          const instance = (rec.data as string).replace(/\.$/, '')
          if (!byInstance.has(instance)) {
            byInstance.set(instance, {
              ptrFrom: matchedType,
              instance,
              addresses: new Set(),
            })
          }
          if (!askedInstance.has(instance)) {
            askedInstance.add(instance)
            followups.push({ name: instance, type: 'SRV' })
            followups.push({ name: instance, type: 'TXT' })
          }
        } else if (rec.type === 'SRV' && rec.data && typeof rec.data === 'object') {
          const data = rec.data as { target?: string; port?: number }
          const pending = byInstance.get(recName)
          if (pending && data.target && typeof data.port === 'number') {
            pending.host = data.target.replace(/\.$/, '')
            pending.port = data.port
            const host = pending.host
            if (!askedHost.has(host)) {
              askedHost.add(host)
              hostsWanted.add(host)
              followups.push({ name: host, type: 'A' })
            }
          }
        } else if (rec.type === 'TXT' && rec.data) {
          const pending = byInstance.get(recName)
          if (pending) {
            const items = Array.isArray(rec.data) ? rec.data : [rec.data]
            for (const item of items) {
              const s = Buffer.isBuffer(item)
                ? item.toString('utf8')
                : String(item)
              const m = s.match(/^ty=(.+)$/)
              if (m && !pending.friendly) pending.friendly = m[1]
            }
          }
        } else if (rec.type === 'A' && typeof rec.data === 'string') {
          if (hostsWanted.has(recName)) {
            for (const pending of byInstance.values()) {
              if (pending.host === recName) {
                pending.addresses.add(rec.data as string)
              }
            }
          }
        }
      }

      if (followups.length > 0) send(followups)
    })

    socket.bind(0, () => {
      // mDNS expects TTL=255 — some responders treat lower TTL as a sign
      // of an off-link sender and silently drop the query (RFC 6762 §11).
      try {
        socket.setMulticastTTL(255)
      } catch {
        // not fatal — many responders accept TTL=1 anyway
      }
      // Initial PTR queries for all printer service types.
      send(MDNS_TYPES.map((t) => ({ name: t, type: 'PTR' as const })))
    })

    // Resend roughly mid-window — catches responders that need a second
    // prompt and any printers that come online during discovery.
    repeatTimer = setTimeout(() => {
      send(MDNS_TYPES.map((t) => ({ name: t, type: 'PTR' as const })))
    }, Math.max(1000, Math.floor(timeoutMs / 3)))

    deadlineTimer = setTimeout(finish, timeoutMs)
  })
}

async function discoverNetwork(
  timeoutMs: number,
): Promise<DiscoveredPrinter[]> {
  const tasks: Array<Promise<DiscoveredPrinter[]>> = []

  if (os.platform() === 'win32') {
    // On Windows, the in-process bonjour-service path silently fails when
    // Apple's mDNSResponder ("Bonjour Service") holds UDP/5353 exclusively.
    // Strategy:
    //   1. Prefer dns-sd.exe if Apple's full Bonjour Print Services is
    //      installed — it talks to mDNSResponder over IPC and gets the
    //      full multicast picture.
    //   2. Otherwise (the common iTunes/printer-driver bundle case),
    //      send unicast-response (QU bit) mDNS queries directly. Works
    //      regardless of who owns 5353.
    //   3. We could fall back to bonjour-service too but it has been
    //      demonstrated to return zero on this configuration, so we skip it.
    if (findDnsSd()) {
      tasks.push(discoverWindowsDnsSd(timeoutMs))
    } else {
      tasks.push(discoverMdnsUnicast(timeoutMs))
    }
    tasks.push(discoverWindowsConfigured())
    tasks.push(discoverWindowsWsd())
  } else {
    tasks.push(discoverMdns(timeoutMs))
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
