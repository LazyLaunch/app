import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { emailsTable } from '@/db/schema'
import type { SelectEmail, InsertEmail } from '@/db/schema'

export async function getEmailsByUser(userId: number): Promise<Partial<SelectEmail>[]> {
  return await db.select().from(emailsTable).where(eq(emailsTable.userId, userId))
}

export async function createEmail(data: InsertEmail): Promise<SelectEmail> {
  return await db.insert(emailsTable).values(data).returning().get()
}
