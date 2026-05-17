# Blomster i Byhaven - Ordre

Desktop order-management app for **Blomster i Byhaven**, a Norwegian flower shop. Manages customers, products, and orders (creation, archive, PDF export) with offline-first local storage. Postal-code and address lookup via the Bring API.

Built as an Electron app with a React + TanStack renderer and a SQLite (Drizzle) database in the main process.

## Stack

| Layer        | Tech                                                                |
| ------------ | ------------------------------------------------------------------- |
| Shell        | Electron 33 (sandboxed renderer, context isolation, strict CSP)     |
| Renderer     | React 19, TanStack Router / Query / Form / Table / DB, Tailwind v4  |
| UI           | shadcn/ui + Radix primitives, Lucide icons                          |
| Database     | SQLite via `better-sqlite3`, schema and migrations with Drizzle ORM |
| PDF          | `@react-pdf/renderer`                                               |
| Build / pack | Vite (renderer), `tsc` (main), Electron Forge (installers)          |
| Updates      | `update-electron-app` against self-hosted Nucleus update server     |

## Project layout

```
electron/      Main process — entry, preload, IPC handlers, DB, electron-store
  ipc/         customers, products, bring (postal lookup), store
  db/          Drizzle schema + migration runner
src/           Renderer
  routes/      TanStack file-based routes (dashboard, new, archive, customers, products, settings)
  components/  UI; new-order/ holds the multi-step order form
  lib/         IPC wrappers (*-server-fns.ts), query keys, theme, utils
drizzle/       SQL migrations (bundled into the installer as extraResource)
assets/        Build assets — icons, entitlements, installer artwork
```

## Getting started

Requires Node 20+ and a working native-build toolchain (needed for `better-sqlite3`).

```bash
npm install                    # native modules (better-sqlite3) build automatically
npm run dev                    # Vite (renderer) + Electron (main) in watch mode
```

`npm run dev` starts Vite on `http://localhost:3000`, builds the main process, then launches Electron pointed at the dev URL with DevTools open.

## Configuration

Create `.env.local` in the project root (gitignored). Loaded by the main process at startup; in production the file is read from `resources/` next to the installed app.

```ini
BRING_API_KEY=...              # https://developer.bring.com (postal/address lookup)
BRING_UID=you@example.com
```

## Database

SQLite file lives in Electron's `userData` directory and is created on first launch. Migrations run automatically on startup from the bundled `drizzle/` folder.

```bash
npm run db:generate            # create a new migration from schema changes
npm run db:migrate             # apply migrations (rarely needed; startup does this)
npm run db:studio              # open Drizzle Studio
```

Schema lives in [electron/db/schema.ts](electron/db/schema.ts).

## Build & package

Packaging and publishing use [Electron Forge](https://www.electronforge.io/).
Targets are Windows (Squirrel `.exe`) and macOS arm64 (`.zip` for auto-update +
the underlying `.app`).

```bash
npm run build                  # vite build + tsc for main → dist/
npm run package                # produce an unpacked app under out/
npm run make                   # produce a Squirrel installer (Win) or .zip (Mac) under out/make/
npm run publish                # make + push to Nucleus (requires env vars below)
```

Forge config: [forge.config.cjs](forge.config.cjs). Build assets (icons, entitlements):
[assets/README.md](assets/README.md).

### Code signing

Both platforms are **unsigned** until certificates are provisioned. SmartScreen
(Windows) and Gatekeeper (macOS) warnings are expected for users. The Forge
config picks up signing automatically when these env vars are present:

| Variable                      | Used for                                    |
| ----------------------------- | ------------------------------------------- |
| `MAC_CSC_LINK`                | Path / URL to macOS `.p12` certificate      |
| `MAC_CSC_KEY_PASSWORD`        | Password for the `.p12`                     |
| `APPLE_ID`                    | Apple ID for notarization                   |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for notarization      |
| `APPLE_TEAM_ID`               | Apple Developer Team ID                     |
| `WIN_CSC_LINK`                | Path to Windows `.pfx` certificate          |
| `WIN_CSC_KEY_PASSWORD`        | Password for the `.pfx`                     |

### Releases

Releases are driven by version tags. CI ([.github/workflows/release.yml](.github/workflows/release.yml))
runs on `windows-latest` and `macos-14` in parallel, packages the app, and
pushes artifacts to the self-hosted Nucleus instance at
`https://update.phenriksen.no/`.

```bash
npm version patch              # bumps package.json, creates v0.1.1 tag
git push --follow-tags
```

### Auto-updates

Packaged builds poll Nucleus every hour via `update-electron-app`
(see [electron/main.ts](electron/main.ts)). Squirrel.Windows applies updates
silently on next launch; Squirrel.Mac downloads in the background and prompts
to restart.

### Required GitHub Secrets

Set these on the repo (Settings → Secrets and variables → Actions):

- `NUCLEUS_HOST` — `https://update.phenriksen.no`
- `NUCLEUS_APP_ID` — app ID from the Nucleus dashboard
- `NUCLEUS_CHANNEL_ID` — channel ID (e.g. the `stable` channel)
- `NUCLEUS_TOKEN` — access token with publish rights to that channel

Signing secrets (`MAC_CSC_LINK`, `APPLE_ID`, `WIN_CSC_LINK`, …) can be added
later; the workflow tolerates them being unset.

### One-time Nucleus setup

On the Nucleus dashboard:

1. Create an app — name `BiB Ordre`, slug `bib-ordre`.
2. Create a channel (e.g. `stable`).
3. Generate an access token scoped to publish to that channel.
4. Copy `appId`, `channelId`, `token`, and the host URL into GitHub Secrets.

## Other scripts

| Command             | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm run lint`      | ESLint (TanStack config)                 |
| `npm run check`     | Prettier write + ESLint --fix            |
| `npm run format`    | Prettier check                           |
| `npm run test`      | Vitest (no tests yet)                    |
| `npm run storybook` | Storybook on port 6006 for UI primitives |

## Security notes

The renderer runs sandboxed with context isolation and a strict CSP defined in [electron/main.ts](electron/main.ts). External `https://` links open in the system browser; all other navigation is blocked. The preload exposes only typed IPC channels (`window.electronAPI`) — no Node access in the renderer.
