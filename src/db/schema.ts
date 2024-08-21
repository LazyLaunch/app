import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import type { ProviderType } from '@/types'

export const usersTable = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  picture: text('image'),
})

export const accountsTable = sqliteTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<ProviderType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  })
)

export const sessionsTable = sqliteTable('user_sessions', {
  id: text('id')
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  fresh: integer('fresh', { mode: 'boolean' }),
})

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

export type InsertAccount = typeof accountsTable.$inferInsert
export type SelectAccount = typeof accountsTable.$inferSelect

export type InsertSession = typeof sessionsTable.$inferInsert
export type SelectSession = typeof sessionsTable.$inferSelect
