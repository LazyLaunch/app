import { db } from '@/db'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { groupsTable, type InsertGroup, type SelectGroup } from '../schema'

export async function isUniqGroupName({
  name,
  projectId,
  teamId,
}: {
  name: string
  projectId: string
  teamId: string
}): Promise<boolean> {
  const obj = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(groupsTable)
    .where(
      and(
        eq(groupsTable.name, name),
        eq(groupsTable.projectId, projectId),
        eq(groupsTable.teamId, teamId)
      )
    )
    .get()

  return Number((obj ?? { exists: 0 }).exists) === 0
}

export async function saveGroup(values: InsertGroup): Promise<SelectGroup> {
  return await db
    .insert(groupsTable)
    .values(values)
    .onConflictDoUpdate({
      target: groupsTable.id,
      set: { name: values.name },
    })
    .returning()
    .get()
}

export async function getGroups({
  projectId,
  teamId,
}: {
  projectId: string
  teamId: string
}): Promise<Partial<SelectGroup>[]> {
  return await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      createdAt: groupsTable.createdAt,
    })
    .from(groupsTable)
    .where(and(eq(groupsTable.projectId, projectId), eq(groupsTable.teamId, teamId)))
    .orderBy(desc(groupsTable.createdAt))
}

export async function bulkDeleteGroups({
  ids,
  projectId,
  teamId,
}: { ids: string[]; projectId: string; teamId: string }): Promise<void> {
  await db
    .delete(groupsTable)
    .where(
      and(
        inArray(groupsTable.id, ids),
        eq(groupsTable.projectId, projectId),
        eq(groupsTable.teamId, teamId)
      )
    )
}
