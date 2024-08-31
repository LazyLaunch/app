import type { ProviderType } from '@/types'
import { relations, sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    picture: text('picture'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      userEmailIdx: uniqueIndex('users_email_idx').on(table.email),
      userUsernameIdx: uniqueIndex('users_username_idx').on(table.username),
    }
  }
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  accounts: many(accountsTable),
  sessions: many(sessionsTable),
  teams: many(teamsTable),
  emails: many(emailsTable),
}))

export const emailsTable = sqliteTable(
  'emails',
  {
    name: text('name').notNull().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    primary: integer('primary', { mode: 'boolean' }).notNull().default(false),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    emailUserIdx: index('emails_user_idx').on(table.userId),
  })
)

export const emailsRelations = relations(emailsTable, ({ one }) => ({
  user: one(usersTable),
}))

export const accountsTable = sqliteTable(
  'accounts',
  {
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<ProviderType>().notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
    accountUserIdx: index('accounts_user_idx').on(table.userId),
  })
)

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}))

export const sessionsTable = sqliteTable(
  'user_sessions',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
    fresh: integer('fresh', { mode: 'boolean' }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      sessionUserIdx: index('sessions_user_idx').on(table.userId),
    }
  }
)

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}))

export const teamsTable = sqliteTable(
  'teams',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    address: text('address').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      teamSlugIdx: uniqueIndex('teams_slug_idx').on(table.slug),
      teamUserIdx: index('teams_user_idx').on(table.userId),
    }
  }
)

export const teamsRelations = relations(teamsTable, ({ one, many }) => ({
  projects: many(projectsTable),
  user: one(usersTable, {
    fields: [teamsTable.userId],
    references: [usersTable.id],
  }),
}))

export const projectsTable = sqliteTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    teamId: text('team_id')
      .notNull()
      .references(() => teamsTable.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      projectSlugIdx: uniqueIndex('projects_slug_idx').on(table.slug),
      projectTeamIdx: index('projects_team_idx').on(table.teamId),
    }
  }
)

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  projects: many(projectsTable),
  user: one(usersTable, {
    fields: [projectsTable.userId],
    references: [usersTable.id],
  }),
  team: one(teamsTable, {
    fields: [projectsTable.teamId],
    references: [teamsTable.id],
  }),
}))

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

export type InsertAccount = typeof accountsTable.$inferInsert
export type SelectAccount = typeof accountsTable.$inferSelect

export type InsertSession = typeof sessionsTable.$inferInsert
export type SelectSession = typeof sessionsTable.$inferSelect

export type InsertTeam = typeof teamsTable.$inferInsert
export type SelectTeam = typeof teamsTable.$inferSelect

export type InsertProject = typeof projectsTable.$inferInsert
export type SelectProject = typeof projectsTable.$inferSelect

export type InsertEmail = typeof emailsTable.$inferInsert
export type SelectEmail = typeof emailsTable.$inferSelect
