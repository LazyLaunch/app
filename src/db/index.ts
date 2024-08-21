import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

export const client = createClient({
  url: import.meta.env.TURSO_CONNECTION_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client)
