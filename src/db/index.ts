import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql/web'

import * as schema from '@/db/schema'

if (typeof window !== 'undefined') {
  throw new Error('Database client must not run on the client side')
}

export const client = createClient({
  url: import.meta.env.TURSO_CONNECTION_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle({ client, schema, logger: process.env.NODE_ENV === 'development' })
