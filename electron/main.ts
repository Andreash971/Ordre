import { app, BrowserWindow, ipcMain, session, shell } from 'electron'
import path from 'node:path'
import started from 'electron-squirrel-startup'
import { initUpdater, registerUpdateHandlers } from './updater'
import { runMigrations } from './db'
import { registerCustomerHandlers } from './ipc/customers'
import { registerProductHandlers } from './ipc/products'
import { registerBringHandlers } from './ipc/bring'
import {
  migrateLegacyOrders,
  pruneExpiredOrders,
  registerOrderHandlers,
} from './ipc/orders'
import { registerStoreHandlers } from './ipc/store'
import {
  spawnPrinterSidecar,
  killPrinterSidecar,
  registerPrinterHandlers,
} from './ipc/printer'
import { registerContextMenuHandlers } from './ipc/contextMenu'

if (started) {
  app.quit()
}

const isDev = !!process.env.ELECTRON_DEV

if (!isDev && process.platform === 'win32') {
  initUpdater()
}

function installSecurityHandlers() {
  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'",
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

function createWindow(): BrowserWindow {
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
      devTools: true,
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
    void win.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  return win
}

app.whenReady().then(async () => {
  runMigrations()
  // Move any pre-SQLite archive into the orders table and drop expired rows
  // before the renderer can query them.
  await migrateLegacyOrders()
  await pruneExpiredOrders()
  registerCustomerHandlers()
  registerProductHandlers()
  registerOrderHandlers()
  registerBringHandlers()
  registerStoreHandlers()
  registerPrinterHandlers()
  registerUpdateHandlers()
  ipcMain.handle('shell:openExternal', (_e, url: string) =>
    shell.openExternal(url),
  )
  spawnPrinterSidecar()

  installSecurityHandlers()
  const win = createWindow()
  registerContextMenuHandlers(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => killPrinterSidecar())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
