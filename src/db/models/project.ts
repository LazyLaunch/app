import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { projectsTable } from '@/db/schema'
import type { SelectProject, InsertProject } from '@/db/schema'

export async function getProjectBySlug(slug: string): Promise<SelectProject | undefined> {
  return await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).get()
}

export async function createProject(data: InsertProject): Promise<SelectProject> {
  return await db.insert(projectsTable).values(data).returning().get()
}
