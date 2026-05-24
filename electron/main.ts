import { app, BrowserWindow, session, shell } from 'electron'
import path from 'node:path'
import started from 'electron-squirrel-startup'
import { updateElectronApp } from 'update-electron-app'

if (started) {
  app.quit()
}

import { runMigrations } from './db'
import { registerCustomerHandlers } from './ipc/customers'
import { registerProductHandlers } from './ipc/products'
import { registerBringHandlers } from './ipc/bring'
import { registerStoreHandlers } from './ipc/store'
import {
  spawnPrinterSidecar,
  killPrinterSidecar,
  registerPrinterHandlers,
} from './ipc/printer'

const isDev = !!process.env.ELECTRON_DEV

if (!isDev && process.platform === 'win32') {
  updateElectronApp({
    repo: 'Andreash971/Ordre',
    updateInterval: '1 hour',
    logger: console,
  })
}

function installSecurityHandlers() {
  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' https://cdn.jsdelivr.net",
    isDev
      ? "connect-src 'self' data: http://localhost:3000 ws://localhost:3000"
      : "connect-src 'self' data:",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    isDev ? "worker-src 'self' blob:" : "worker-src 'self'",
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
  runMigrations()
  registerCustomerHandlers()
  registerProductHandlers()
  registerBringHandlers()
  registerStoreHandlers()
  registerPrinterHandlers()
  spawnPrinterSidecar()

  installSecurityHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => killPrinterSidecar())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
