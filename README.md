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
| Build / pack | Vite (renderer), `tsc` (main), `electron-builder` (installers)      |

## Project layout

```
electron/      Main process — entry, preload, IPC handlers, DB, electron-store
  ipc/         customers, products, bring (postal lookup), store
  db/          Drizzle schema + migration runner
src/           Renderer
  routes/      TanStack file-based routes (dashboard, new, archive, customers, products, settings)
  components/  UI; new-order/ holds the multi-step order form
  lib/         IPC wrappers (*-server-fns.ts), query keys, theme, utils
drizzle/       SQL migrations (bundled into the installer via electron-builder)
```

## Getting started

Requires Node 20+ and a working native-build toolchain (needed for `better-sqlite3`).

```bash
npm install                    # also runs electron-builder install-app-deps
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

```bash
npm run build                  # vite build + tsc for main → dist/
npm run build:win              # build, then produce a Windows NSIS installer in release/
```

Installer config: [electron-builder.yml](electron-builder.yml).

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
