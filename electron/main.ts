import { app, BrowserWindow } from 'electron'
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
      sandbox: false,
    },
  })

  if (isDev) {
    void win.loadURL('http://localhost:3000')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  loadEnvFile()
  runMigrations()
  registerCustomerHandlers()
  registerProductHandlers()
  registerBringHandlers()
  registerStoreHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
