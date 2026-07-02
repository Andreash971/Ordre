/**
 * The renderer's view of the preload API. The type is derived from the
 * preload script itself, so the two can never drift apart.
 */
import type { ElectronAPI } from '../../electron/preload'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
