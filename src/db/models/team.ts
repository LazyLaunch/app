import { alphabet, generateRandomString } from 'oslo/crypto'
import slug from 'slug'

import { db } from '@/db'
import type { InsertTeam, SelectTeam } from '@/db/schema'
import { projectsTable, teamsTable } from '@/db/schema'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'
import type { Column, InferSelectModel } from 'drizzle-orm'
import { eq, sql } from 'drizzle-orm'

type TeamsTableColumns = keyof InferSelectModel<typeof teamsTable>
type SelectedFieldsType = Partial<Record<TeamsTableColumns, Column<any, any>>>

interface TeamsByUserProps {
  userId: string
  fields?: TeamsTableColumns[]
}

interface InsertProps extends Omit<InsertTeam, 'slug'> {
  slug?: string
}

interface InitTeamAndProjectProps {
  teamName: string
  projectName: string
  address: string
  userId: string
}

export async function getTeamsByUser({
  userId,
  fields,
}: TeamsByUserProps): Promise<Partial<SelectTeam>[]> {
  const selectedFields: SelectedFieldsType = fields
    ? fields.reduce((acc, field) => {
        acc[field] = teamsTable[field]
        return acc
      }, {} as SelectedFieldsType)
    : teamsTable

  return await db.select(selectedFields).from(teamsTable).where(eq(teamsTable.userId, userId))
}

export async function createTeam(data: InsertProps): Promise<SelectTeam> {
  const generatedSlug = slug(
    `${data.name}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )
  return await db
    .insert(teamsTable)
    .values({ slug: generatedSlug, ...data })
    .returning()
    .get()
}

export async function updateTeam(slug: string, data: InsertTeam): Promise<SelectTeam> {
  return await db.update(teamsTable).set(data).where(eq(teamsTable.slug, slug)).returning().get()
}

export async function existsTeam(userId: string): Promise<boolean> {
  const query = sql`select exists(select 1 from ${teamsTable} where (${teamsTable.userId} = ${userId}))`
  const result = (await db.get(query)) || {}
  return Object.values(result)[0] > 0
}

export async function initTeamWithProject({
  teamName,
  projectName,
  address,
  userId,
}: InitTeamAndProjectProps) {
  const generatedTeamSlug = slug(
    `${teamName}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )
  const generatedProjectSlug = slug(
    `${projectName}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )

  await db.transaction(async (tx) => {
    const team = await tx
      .insert(teamsTable)
      .values({ slug: generatedTeamSlug, name: teamName, userId, address })
      .returning()
      .get()

    await tx
      .insert(projectsTable)
      .values({ slug: generatedProjectSlug, name: projectName, userId, teamId: team.id })
      .returning()
      .get()
  })
}
