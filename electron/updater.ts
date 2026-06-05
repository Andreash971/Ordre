import { BrowserWindow, autoUpdater, ipcMain } from 'electron'
import { updateElectronApp, type IUpdateInfo } from 'update-electron-app'

const REPO = 'Andreash971/Ordre'

export interface PendingUpdate {
  version: string
  changelog: string
}

let pendingUpdate: PendingUpdate | null = null

async function fetchChangelog(version: string): Promise<string> {
  const tag = version.startsWith('v') ? version : `v${version}`
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/tags/${tag}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Ordre',
        },
      },
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { body?: string }
    return typeof data.body === 'string' ? data.body.trim() : ''
  } catch {
    return ''
  }
}

async function handleUpdateDownloaded(info: IUpdateInfo): Promise<void> {
  const version = (info.releaseName || '').replace(/^v/, '')
  const changelog =
    (await fetchChangelog(info.releaseName || version)) ||
    (info.releaseNotes?.trim() || '')

  pendingUpdate = { version, changelog }

  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('update:available', pendingUpdate)
  }
}

export function registerUpdateHandlers(): void {
  // Dev preview: run with `MOCK_UPDATE=1 npm run dev` to seed a fake pending
  // update so the sidebar card + changelog dialog render without a real release.
  if (process.env.MOCK_UPDATE) {
    pendingUpdate = {
      version: '1.0.8',
      changelog: '## Endringer\n- Fikset utskrift\n- Raskere oppstart',
    }
  }
  ipcMain.handle('update:getPending', () => pendingUpdate)
  ipcMain.handle('update:install', () => autoUpdater.quitAndInstall())
}

export function initUpdater(): void {
  updateElectronApp({
    repo: REPO,
    updateInterval: '1 hour',
    logger: console,
    onNotifyUser: handleUpdateDownloaded,
  })
}
