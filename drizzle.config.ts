import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './electron/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
})
