/**
 * Update-notification IPC contract shared by the electron main process and
 * the renderer.
 */
export interface PendingUpdate {
  version: string
  changelog: string
  /** Set for beta releases, which are downloaded manually from GitHub. */
  downloadUrl?: string
}
