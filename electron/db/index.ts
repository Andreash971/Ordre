import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { app } from 'electron'

import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (_db) return _db

  // Historical filename from before the app was renamed to "Ordre"; not worth
  // a data migration for existing installs.
  const dbPath = path.join(app.getPath('userData'), 'bib-ordre.db')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  // SQLite's built-in LOWER() only folds ASCII, so 'Ø' never matches 'ø' and
  // searching "øystein" misses a customer stored as "Øystein". Register a
  // JS-backed lower() with correct Unicode case folding for search queries.
  sqlite.function('unicode_lower', { deterministic: true }, (value: unknown) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )

  _db = drizzle(sqlite, { schema })
  return _db
}

/**
 * Unicode-correct, case-insensitive substring match. Also treats the query
 * literally — unlike LIKE, `%` and `_` typed by the user are not wildcards.
 */
export function containsInsensitive(
  column: AnySQLiteColumn,
  query: string,
): SQL {
  return sql`instr(unicode_lower(${column}), unicode_lower(${query})) > 0`
}

export function runMigrations() {
  const isDev = !app.isPackaged
  const migrationsFolder = isDev
    ? path.join(process.cwd(), 'drizzle')
    : path.join(process.resourcesPath, 'drizzle')
  migrate(getDb(), { migrationsFolder })
}

export { schema }
