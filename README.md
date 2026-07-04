# Ordre

Desktop order-management app for a small Norwegian flower shop. Manages customers, products, and orders (creation, archive, PDF export) with offline-first local storage. Postal-code and address lookup via the Bring API.

On first launch the app prompts you to enter your company information (display name shown in the sidebar and on document headers, plus the legal name and address used in the document address block). All of it is editable later under **Innstillinger → Bedriftsinformasjon**.

Built as an Electron app with a React + TanStack renderer and a SQLite (Drizzle) database in the main process.

## Stack

| Layer        | Tech                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Shell        | Electron 33 (sandboxed renderer, context isolation, strict CSP)         |
| Renderer     | React 19, TanStack Router / Query / Form / Table / DB, Tailwind v4      |
| UI           | shadcn/ui + Radix primitives, Lucide icons                              |
| Database     | SQLite via `better-sqlite3`, schema and migrations with Drizzle ORM     |
| PDF          | `@react-pdf/renderer`                                                   |
| Build / pack | Vite (renderer), `tsc` (main), Electron Forge (installers)              |
| Updates      | `update-electron-app` against `update.electronjs.org` (GitHub Releases) |

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
Target is Windows (Squirrel `.exe`). macOS builds were removed pending code
signing — they can be reintroduced by re-adding `@electron-forge/maker-zip`
plus the `darwin` matrix entry once Apple Developer ID certs are available.

```bash
npm run build                  # vite build + tsc for main → dist/
npm run package                # produce an unpacked app under out/
npm run make                   # produce a Squirrel installer under out/make/
npm run publish                # make + upload a draft release to GitHub
```

Forge config: [forge.config.cjs](forge.config.cjs). Build assets (icons, entitlements):
[assets/README.md](assets/README.md).

### Code signing

Windows builds are **unsigned** unless a signing cert is provided — SmartScreen
warnings are expected for users without it. The Forge config picks up signing
automatically when these env vars are present:

| Variable               | Used for                           |
| ---------------------- | ---------------------------------- |
| `WIN_CSC_LINK`         | Path to Windows `.pfx` certificate |
| `WIN_CSC_KEY_PASSWORD` | Password for the `.pfx`            |

### Releases

Releases are driven by version tags. CI ([.github/workflows/release.yml](.github/workflows/release.yml))
runs on `windows-latest`, packages the app, and publishes a **draft prerelease**
on GitHub via `@electron-forge/publisher-github` with the Squirrel `.exe`,
`.nupkg`, and `RELEASES` files attached. Review the draft on the GitHub
Releases page and click **Publish** to make it visible to auto-updaters.

```bash
npm version patch              # bumps package.json, creates v0.1.1 tag
git push --follow-tags
```

### Auto-updates

Packaged Windows builds poll [update.electronjs.org](https://update.electronjs.org/)
every hour via `update-electron-app` (see [electron/main.ts](electron/main.ts)).
The service serves updates directly from the `Andreash971/Ordre` GitHub
Releases. Squirrel.Windows applies the update silently on next launch.

`update.electronjs.org` requires the repository to be **public**. While the
repo is private, the update check will 404 (silently logged); installer
downloads from the Releases page still work.

### Required GitHub Secrets

The publish step uses the workflow's built-in `GITHUB_TOKEN` to create releases
— no additional secret needed for the publisher itself.

Optional Windows signing secrets:

- `WIN_CSC_LINK_BASE64` — base64-encoded `.pfx` certificate
- `WIN_CSC_KEY_PASSWORD` — password for the `.pfx`

The workflow tolerates them being unset (builds unsigned).

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
