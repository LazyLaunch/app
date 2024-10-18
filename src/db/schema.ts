import type { UserRoles } from '@/lib/rbac'
import type { ContentProps, EmailTemplateSettings, EmojiProps } from '@/stores/template-store'
import type { ProviderType } from '@/types'
import { sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id', { length: 256 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name', { length: 32 }).notNull(),
    username: text('username', { length: 50 }).notNull(),
    email: text('email', { length: 256 }).notNull(),
    picture: text('picture', { length: 256 }),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
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

export const emailsTable = sqliteTable(
  'emails',
  {
    name: text('name', { length: 256 }).notNull().primaryKey(),
    userId: text('user_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    primary: integer('primary', { mode: 'boolean' }).notNull().default(false),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    emailUserIdx: index('emails_user_idx').on(table.userId),
  })
)

export const accountsTable = sqliteTable(
  'accounts',
  {
    provider: text('provider', { length: 32 }).notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    userId: text('user_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: text('type', { length: 50 }).$type<ProviderType>().notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
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

export const sessionsTable = sqliteTable(
  'user_sessions',
  {
    id: text('id', { length: 256 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
    fresh: integer('fresh', { mode: 'boolean' }),
    createdAt: text('created_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      sessionUserIdx: index('sessions_user_idx').on(table.userId),
    }
  }
)

export const teamsTable = sqliteTable(
  'teams',
  {
    id: text('id', { length: 256 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name', { length: 50 }).notNull(),
    slug: text('slug', { length: 50 }).notNull(),
    address: text('address', { length: 256 }).notNull(),
    ownerId: text('owner_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      teamSlugIdx: uniqueIndex('teams_slug_idx').on(table.slug),
      teamOwnerIdx: index('teams_owner_idx').on(table.ownerId),
    }
  }
)

export const projectsTable = sqliteTable(
  'projects',
  {
    id: text('id', { length: 256 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name', { length: 50 }).notNull(),
    slug: text('slug', { length: 50 }).notNull(),
    teamId: text('team_id', { length: 256 })
      .notNull()
      .references(() => teamsTable.id, { onDelete: 'cascade' }),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
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

export const userTeamsTable = sqliteTable(
  'user_teams',
  {
    userId: text('user_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    teamId: text('team_id', { length: 256 })
      .notNull()
      .references(() => teamsTable.id, { onDelete: 'cascade' }),
    role: text('role', { length: 50 }).notNull().$type<UserRoles>(),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.userId, table.teamId],
    }),
  })
)

export const emailTemplatesTable = sqliteTable(
  'email_templates',
  {
    id: text('id', { length: 256 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name', { length: 50 }).notNull(),
    description: text('description', { length: 256 }),
    emoji: text('emoji', { mode: 'json' }).$type<EmojiProps>().notNull(),
    content: text('content', { mode: 'json' }).$type<ContentProps[]>().notNull(),
    settings: text('settings', { mode: 'json' }).$type<EmailTemplateSettings>().notNull(),
    userId: text('user_id', { length: 256 })
      .notNull()
      .references(() => usersTable.id),
    projectId: text('project_id', { length: 256 })
      .notNull()
      .references(() => projectsTable.id, { onDelete: 'cascade' }),
    updatedAt: text('updated_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    createdAt: text('created_at', { length: 50 })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      emailTemplateName: index('email_templates_name').on(table.name),
      emailTemplateUserIdx: index('email_templates_user_idx').on(table.userId),
      emailTemplateProjectIdx: index('email_templates_project_idx').on(table.projectId),
    }
  }
)

// export const campaignsTable = sqliteTable(
//   'campaigns',
//   {
//     id: text('id', { length: 256 })
//       .primaryKey()
//       .notNull()
//       .$defaultFn(() => crypto.randomUUID()),
//     name: text('name', { length: 256 }).notNull(),
//     subject: text('subject', { length: 256 }).notNull(),
//     from: text('from', { length: 256 }).notNull(),
//     preheader: text('preheader', { length: 256 }).notNull(),
//     userId: text('user_id', { length: 256 })
//       .notNull()
//       .references(() => usersTable.id),
//     projectId: text('project_id', { length: 256 })
//       .notNull()
//       .references(() => projectsTable.id, { onDelete: 'cascade' }),
//     updatedAt: text('updated_at', { length: 50 })
//       .notNull()
//       .default(sql`(CURRENT_TIMESTAMP)`)
//       .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
//     createdAt: text('created_at', { length: 50 })
//       .notNull()
//       .default(sql`(CURRENT_TIMESTAMP)`),
//   },
//   (table) => {
//     return {
//       campaignUserIdx: index('campaigns_user_idx').on(table.userId),
//       campaignProjectIdx: index('campaigns_project_idx').on(table.projectId),
//     }
//   }
// )

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

export type InsertUserTeam = typeof userTeamsTable.$inferInsert
export type SelectUserTeam = typeof userTeamsTable.$inferSelect

export type InsertEmailTemplate = typeof emailTemplatesTable.$inferInsert
export type SelectEmailTemplate = typeof emailTemplatesTable.$inferSelect

// export type InsertCampaign = typeof campaignsTable.$inferInsert
// export type SelectCampaign = typeof campaignsTable.$inferSelect
