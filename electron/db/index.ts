import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'

import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (_db) return _db

  const dbPath = path.join(app.getPath('userData'), 'ordreflyt.db')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  _db = drizzle(sqlite, { schema })
  return _db
}

export function runMigrations() {
  const isDev = !app.isPackaged
  const migrationsFolder = isDev
    ? path.join(process.cwd(), 'drizzle')
    : path.join(process.resourcesPath, 'drizzle')
  migrate(getDb(), { migrationsFolder })
}

export { schema }
