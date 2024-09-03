import { alphabet, generateRandomString } from 'oslo/crypto'
import slug from 'slug'

import { db } from '@/db'
import type { InsertProject, SelectProject } from '@/db/schema'
import { projectsTable } from '@/db/schema'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'
import type { Column, InferSelectModel } from 'drizzle-orm'
import { and, eq, sql } from 'drizzle-orm'

type ProjectsTableColumns = keyof InferSelectModel<typeof projectsTable>
type SelectedFieldsType = Partial<Record<ProjectsTableColumns, Column<any, any>>>

interface InsertProps extends Omit<InsertProject, 'slug'> {
  slug?: string
}

interface ProjectsByTeamProps {
  teamId: string
  fields?: ProjectsTableColumns[]
}

interface ProjectByTeamProps extends ProjectsByTeamProps {
  slug: string
}

function selectedFields(fields: ProjectsTableColumns[]): SelectedFieldsType {
  return fields
    ? fields.reduce((acc, field) => {
        acc[field] = projectsTable[field]
        return acc
      }, {} as SelectedFieldsType)
    : projectsTable
}

export async function getProjectBySlugAndTeam({
  slug,
  teamId,
  fields,
}: ProjectByTeamProps): Promise<Partial<SelectProject | undefined>> {
  return await db
    .select(selectedFields(fields!))
    .from(projectsTable)
    .where(and(eq(projectsTable.teamId, teamId), eq(projectsTable.slug, slug)))
    .get()
}

export async function getProjectsByTeam({
  teamId,
  fields,
}: ProjectsByTeamProps): Promise<Partial<SelectProject>[]> {
  return await db
    .select(selectedFields(fields!))
    .from(projectsTable)
    .where(eq(projectsTable.teamId, teamId))
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
  const query = sql`select exists(select 1 from ${projectsTable} where (${projectsTable.slug} = ${slug}))`
  const result = (await db.get(query)) || {}
  return Object.values(result)[0] > 0
}
