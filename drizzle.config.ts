import { config } from 'dotenv'
import type { Config } from 'drizzle-kit'

config({ path: '.env' })

export default {
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    token: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config
