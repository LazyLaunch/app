import slug from 'slug'
import { generateRandomString, alphabet } from 'oslo/crypto'

import { eq, count } from 'drizzle-orm'
import { db } from '@/db'
import { teamsTable } from '@/db/schema'
import type { SelectTeam, InsertTeam } from '@/db/schema'
import type { InferSelectModel, Column } from 'drizzle-orm'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'

type TeamsTableColumns = keyof InferSelectModel<typeof teamsTable>
type SelectedFieldsType = Partial<Record<TeamsTableColumns, Column<any, any>>>

interface TeamsByUserProps {
  userId: number
  fields?: TeamsTableColumns[]
}

interface InsertProps extends Omit<InsertTeam, 'slug'> {
  slug?: string
}

export async function anyTeamByUser(userId: number): Promise<Boolean> {
  const team = await db
    .select({ count: count() })
    .from(teamsTable)
    .where(eq(teamsTable.userId, userId))
    .get()
  return Boolean(team && team.count > 0)
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
