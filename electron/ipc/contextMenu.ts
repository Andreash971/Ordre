import type { BrowserWindow } from 'electron'
import { Menu } from 'electron'

export function registerContextMenuHandlers(win: BrowserWindow): void {
  win.webContents.on('context-menu', () => {
    const menu = Menu.buildFromTemplate([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectAll' },
    ])
    menu.popup({ window: win })
  })
}
