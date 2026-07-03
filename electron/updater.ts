import { app, BrowserWindow, autoUpdater, ipcMain } from 'electron'
import { updateElectronApp } from 'update-electron-app'
import type { IUpdateInfo } from 'update-electron-app'
import type { PendingUpdate } from '../shared/updates'
import { isNewerVersion } from '../shared/version'
import { getStore } from './store'

const REPO = 'Andreash971/Ordre'

let pendingUpdate: PendingUpdate | null = null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function broadcastUpdate(update: PendingUpdate): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('update:available', update)
  }
}

// ---------------------------------------------------------------------------
// Stable update (via update-electron-app / Squirrel)
// ---------------------------------------------------------------------------

async function handleUpdateDownloaded(info: IUpdateInfo): Promise<void> {
  const version = (info.releaseName || '').replace(/^v/, '')
  const changelog =
    (await fetchChangelog(info.releaseName || version)) ||
    (info.releaseNotes || '').trim()

  pendingUpdate = { version, changelog }
  broadcastUpdate(pendingUpdate)
}

// ---------------------------------------------------------------------------
// Beta update (direct GitHub Releases API check)
// ---------------------------------------------------------------------------

interface GitHubRelease {
  tag_name: string
  prerelease: boolean
  draft: boolean
  html_url: string
  body?: string
}

async function checkForBetaUpdate(): Promise<void> {
  try {
    const store = await getStore()
    if (!store.get('settings').betaChannel) return

    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Ordre',
      },
    })
    if (!res.ok) return

    const releases = (await res.json()) as GitHubRelease[]
    const latest = releases.find((r) => r.prerelease && !r.draft)
    if (!latest) return

    const releaseVersion = latest.tag_name.replace(/^v/, '')
    if (!isNewerVersion(releaseVersion, app.getVersion())) return
    if (pendingUpdate?.version === releaseVersion) return // already notified

    const changelog = latest.body?.trim() || ''
    pendingUpdate = {
      version: releaseVersion,
      changelog,
      downloadUrl: latest.html_url,
    }
    broadcastUpdate(pendingUpdate)
  } catch {
    // silently ignore network/parse errors
  }
}

// ---------------------------------------------------------------------------
// IPC registration
// ---------------------------------------------------------------------------

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

  // Beta channel: periodic check (skip in MOCK_UPDATE mode)
  if (!process.env.MOCK_UPDATE) {
    setTimeout(() => void checkForBetaUpdate(), 30_000) // first check 30s after startup
    setInterval(() => void checkForBetaUpdate(), 60 * 60 * 1000) // then hourly
  }
}

// ---------------------------------------------------------------------------
// Stable updater init (Windows production only)
// ---------------------------------------------------------------------------

export function initUpdater(): void {
  updateElectronApp({
    repo: REPO,
    updateInterval: '1 hour',
    logger: console,
    onNotifyUser: handleUpdateDownloaded,
  })
}
