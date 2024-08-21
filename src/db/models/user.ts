import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { usersTable } from '@/db/schema'
import type { SelectUser, InsertUser } from '@/db/schema'

export async function getUserByEmail(email: string): Promise<SelectUser | undefined> {
  return await db.select().from(usersTable).where(eq(usersTable.email, email)).get()
}

export async function createUser(data: InsertUser): Promise<SelectUser> {
  return await db.insert(usersTable).values(data).returning().get()
}
