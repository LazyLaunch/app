import { Lucia } from 'lucia'
import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite'
import { Google } from 'arctic'

import { client } from '@/db'
import type { SelectUser, SelectSession } from '@/db/schema'

const adapter = new LibSQLAdapter(client, {
  user: 'users',
  session: 'user_sessions',
})

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: ({ name, email }) => ({ name, email }),
})

export const googleAuth = new Google(
  import.meta.env.AUTH_GOOGLE_ID,
  import.meta.env.AUTH_GOOGLE_SECRET,
  'http://localhost:4321/login/google/callback'
)

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: Omit<SelectUser, 'id'>
    DatabaseSessionAttributes: SelectSession
  }
}
