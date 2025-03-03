import { db } from '@/db'
import { customFieldsTable, type InsertCustomField, type SelectCustomField } from '@/db/schema'
import { toTag } from '@/lib/to-tag'
import { and, eq, inArray, sql } from 'drizzle-orm'

export interface CustomFieldProps
  extends Omit<SelectCustomField, 'teamId' | 'projectId' | 'userId'> {}

export interface CustomFieldList extends CustomFieldProps {
  isCustomField: boolean
}

export async function getCustomFields({
  projectId,
  teamId,
}: {
  projectId: string
  teamId: string
}): Promise<CustomFieldProps[]> {
  return await db
    .select({
      id: customFieldsTable.id,
      name: customFieldsTable.name,
      tag: customFieldsTable.tag,
      type: customFieldsTable.type,
      createdAt: customFieldsTable.createdAt,
      updatedAt: customFieldsTable.updatedAt,
    })
    .from(customFieldsTable)
    .where(and(eq(customFieldsTable.projectId, projectId), eq(customFieldsTable.teamId, teamId)))
}

export async function isUniqCustomFieldName(name: string, projectId: string): Promise<boolean> {
  const obj = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(customFieldsTable)
    .where(and(eq(customFieldsTable.name, name), eq(customFieldsTable.projectId, projectId)))
    .get()

  return Number((obj ?? { exists: 0 }).exists) === 0
}

export async function createCustomField(
  data: Omit<InsertCustomField, 'tag'>
): Promise<SelectCustomField> {
  const tag = toTag(data.name)

  return await db
    .insert(customFieldsTable)
    .values({ ...data, tag })
    .returning()
    .get()
}

export async function bulkDeleteCustomField({ ids }: { ids: string[] }): Promise<void> {
  await db.delete(customFieldsTable).where(inArray(customFieldsTable.id, ids))
}

interface UpdateCustomFieldData extends Pick<InsertCustomField, 'name' | 'projectId'> {
  id: string
}

export async function updateCustomField({
  id,
  projectId,
  ...data
}: UpdateCustomFieldData): Promise<void> {
  await db
    .update(customFieldsTable)
    .set(data)
    .where(and(eq(customFieldsTable.id, id), eq(customFieldsTable.projectId, projectId)))
}

export async function hasCustomFieldsPermission({
  ids,
  userId,
}: {
  ids: string[]
  userId: string
}): Promise<boolean> {
  const [{ isAllowed }] = await db
    .select({
      isAllowed: sql<boolean>`
        EXISTS (
          SELECT 1
          FROM custom_fields cf
          JOIN projects p ON cf.project_id = p.id
          JOIN teams t ON p.team_id = t.id
          JOIN user_teams ut ON ut.team_id = t.id
          WHERE cf.id IN (${sql.join(ids, sql`, `)})
          AND ut.user_id = ${userId}
          AND ut.role = 'owner'
        )
      `.as('isAllowed'),
    })
    .from(customFieldsTable)
    .limit(1)

  return Boolean(isAllowed)
}
