import { db } from '@/db'
import { and, desc, eq } from 'drizzle-orm'

import type { Team } from '@/db/models/team'
import {
  emailTemplatesTable,
  projectsTable,
  type InsertEmailTemplate,
  type SelectEmailTemplate,
} from '@/db/schema'

import { UserRolesEnum } from '@/lib/rbac'

// const MAX_BLOB_SIZE = 1 * 1024 * 1024

export async function getEmailTemplate({
  id,
}: {
  id: string
}): Promise<Partial<SelectEmailTemplate | undefined>> {
  return await db
    .select({
      id: emailTemplatesTable.id,
      name: emailTemplatesTable.name,
      description: emailTemplatesTable.description,
      emoji: emailTemplatesTable.emoji,
      content: emailTemplatesTable.content,
      settings: emailTemplatesTable.settings,
    })
    .from(emailTemplatesTable)
    .innerJoin(projectsTable, eq(emailTemplatesTable.projectId, projectsTable.id))
    .where(eq(emailTemplatesTable.id, id))
    .get()
}

export async function getEmailTemplatesByProject({
  projectId,
}: {
  projectId: string
}): Promise<Partial<SelectEmailTemplate>[]> {
  return await db
    .select({
      id: emailTemplatesTable.id,
      name: emailTemplatesTable.name,
      description: emailTemplatesTable.description,
      emoji: emailTemplatesTable.emoji,
    })
    .from(emailTemplatesTable)
    .where(eq(emailTemplatesTable.projectId, projectId))
    .orderBy(desc(emailTemplatesTable.createdAt))
}

export async function createEmailTemplate(data: InsertEmailTemplate): Promise<SelectEmailTemplate> {
  // if (data.content.length > MAX_BLOB_SIZE) {
  //   throw new Error('Content exceeds the 1 MB size limit');
  // }

  return await db.insert(emailTemplatesTable).values(data).returning().get()
}

export interface UpdateEmailTemplateProps
  extends Omit<InsertEmailTemplate, 'updatedAt' | 'createdAt' | 'userId' | 'id'> {
  id: string
}

export interface UpdateEmailTemplateData {
  data: UpdateEmailTemplateProps
  team: Team
}

export async function updateEmailTemplate({
  data,
  team,
}: UpdateEmailTemplateData): Promise<SelectEmailTemplate | boolean> {
  if (!team || team?.role !== UserRolesEnum.OWNER) return false

  return await db
    .update(emailTemplatesTable)
    .set(data)
    .where(
      and(eq(emailTemplatesTable.id, data.id), eq(emailTemplatesTable.projectId, data.projectId))
    )
    .returning()
    .get()
}
