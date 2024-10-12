import { and, eq, sql } from 'drizzle-orm'
import { alphabet, generateRandomString } from 'oslo/crypto'
import slug from 'slug'

import type { InsertProject, SelectProject } from '@/db/schema'

import { db } from '@/db'
import { projectsTable, teamsTable, userTeamsTable } from '@/db/schema'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'

export async function getProjectBySlugAndUser({
  slug,
  userId,
}: {
  slug: string
  userId: string
}): Promise<Partial<SelectProject | undefined>> {
  return await db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
      slug: projectsTable.slug,
      teamId: projectsTable.teamId,
    })
    .from(projectsTable)
    .innerJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .innerJoin(
      userTeamsTable,
      and(eq(teamsTable.id, userTeamsTable.teamId), eq(userTeamsTable.userId, userId))
    )
    .where(eq(projectsTable.slug, slug))
    .get()
}

export async function getProjectsByTeam({
  teamId,
}: {
  teamId: string
}): Promise<Partial<SelectProject>[]> {
  return await db
    .select({
      name: projectsTable.name,
      slug: projectsTable.slug,
    })
    .from(projectsTable)
    .innerJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .where(eq(teamsTable.id, teamId))
}

interface InsertProps extends Omit<InsertProject, 'slug'> {
  slug?: string
}

export async function createProject(data: InsertProps): Promise<SelectProject> {
  const generatedSlug = slug(
    `${data.name}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )
  return await db
    .insert(projectsTable)
    .values({ slug: generatedSlug, ...data })
    .returning()
    .get()
}

export async function deleteProject(slug: string, teamId: string): Promise<void> {
  await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.slug, slug), eq(projectsTable.teamId, teamId)))
}

export async function existsSlug(slug: string): Promise<boolean> {
  const project = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(projectsTable)
    .where(eq(projectsTable.slug, slug))
    .get()

  return Number(project?.exists) > 0
}
