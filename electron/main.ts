import { app, BrowserWindow, session, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

import { runMigrations } from './db'
import { registerCustomerHandlers } from './ipc/customers'
import { registerProductHandlers } from './ipc/products'
import { registerBringHandlers } from './ipc/bring'
import { registerStoreHandlers } from './ipc/store'

const isDev = !!process.env.ELECTRON_DEV

function loadEnvFile() {
  const candidates = isDev
    ? [path.join(process.cwd(), '.env.local')]
    : [
        path.join(process.resourcesPath, '.env.local'),
        path.join(path.dirname(app.getPath('exe')), '.env.local'),
      ]
  const envPath = candidates.find((p) => fs.existsSync(p))
  if (!envPath) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    const [, k, vRaw] = m
    if (process.env[k]) continue
    process.env[k] = vRaw.replace(/^["'](.*)["']$/, '$1')
  }
}

function installSecurityHandlers() {
  const csp = [
    "default-src 'self'",
    isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    isDev
      ? "connect-src 'self' http://localhost:3000 ws://localhost:3000"
      : "connect-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "worker-src 'self'",
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'X-Content-Type-Options': ['nosniff'],
        'Referrer-Policy': ['no-referrer'],
      },
    })
  })

  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) =>
    cb(false),
  )
  session.defaultSession.setPermissionCheckHandler(() => false)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      spellcheck: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      }
    }
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? 'http://localhost:3000' : 'file://'
    if (!url.startsWith(allowed)) event.preventDefault()
  })

  if (isDev) {
    void win.loadURL('http://localhost:3000')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'))
    win.webContents.on('devtools-opened', () => win.webContents.closeDevTools())
  }
}

app.whenReady().then(() => {
  loadEnvFile()
  runMigrations()
  registerCustomerHandlers()
  registerProductHandlers()
  registerBringHandlers()
  registerStoreHandlers()

  installSecurityHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
