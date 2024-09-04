import { db } from '@/db'
import type { InsertUser, SelectUser } from '@/db/schema'
import { usersTable } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function getUserByEmail(email: string): Promise<SelectUser | undefined> {
  return await db.select().from(usersTable).where(eq(usersTable.email, email)).get()
}

export async function createUser(data: InsertUser): Promise<SelectUser> {
  return await db.insert(usersTable).values(data).returning().get()
}

export async function updateUser(userId: string, data: InsertUser): Promise<void> {
  await db.update(usersTable).set(data).where(eq(usersTable.id, userId))
}

export async function existsUsername(username: string): Promise<boolean> {
  const user = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .get()

  return Number(user?.exists) > 0
}
