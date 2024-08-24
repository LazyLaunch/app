import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { teamsTable } from '@/db/schema'
import type { SelectTeam, InsertTeam } from '@/db/schema'

export async function getTeamBySlug(slug: string): Promise<SelectTeam | undefined> {
  return await db.select().from(teamsTable).where(eq(teamsTable.slug, slug)).get()
}

export async function getTeamsByUser(userId: string): Promise<SelectTeam | undefined> {
  return await db.select().from(teamsTable).where(eq(teamsTable.userId, userId)).get()
}

export async function createTeam(data: InsertTeam): Promise<SelectTeam> {
  return await db.insert(teamsTable).values(data).returning().get()
}

export async function updateTeam(slug: string, data: InsertTeam): Promise<SelectTeam> {
  return await db.update(teamsTable).set(data).where(eq(teamsTable.slug, slug)).returning().get()
}
