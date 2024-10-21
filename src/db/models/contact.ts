import { db } from '@/db'
import type {
  InsertContact,
  SelectContact,
  SelectContactCustomField,
  SelectCustomField,
} from '@/db/schema'
import { contactCustomFieldsTable, contactsTable, customFieldsTable } from '@/db/schema'
import { and, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

const SKIP_CONTACT_COLUMNS: string[] = [
  'created_at',
  'updated_at',
  'team_id',
  'project_id',
  'user_id',
  'id',
] as const

interface ContactCustomFields extends Pick<SelectCustomField, 'name' | 'type'> {
  value: Pick<SelectContactCustomField, 'value'>
}

interface ExtendedContact extends SelectContact {
  customFields: ContactCustomFields[]
}

export interface ContactProps
  extends Omit<ExtendedContact, 'updatedAt' | 'createdAt' | 'projectId' | 'teamId' | 'userId'> {}

export async function getContact({
  projectId,
  teamId,
}: {
  projectId: string
  teamId: string
}): Promise<ContactProps[]> {
  return await db
    .select({
      id: contactsTable.id,
      email: contactsTable.email,
      firstName: contactsTable.firstName,
      lastName: contactsTable.lastName,
      subscribed: contactsTable.subscribed,
      source: contactsTable.source,
      customFields: sql<ContactCustomFields[]>`
        CASE WHEN COUNT(custom_fields.id) = 0 THEN NULL
          ELSE json_group_array(
            json_object(
              'name', custom_fields.name,
              'type', custom_fields.type,
              'value', contact_custom_fields.value
            )
          )
        END`.as('custom_fields'),
    })
    .from(contactsTable)
    .leftJoin(contactCustomFieldsTable, eq(contactsTable.id, contactCustomFieldsTable.contactId))
    .leftJoin(customFieldsTable, eq(customFieldsTable.id, contactCustomFieldsTable.customFieldId))
    .where(and(eq(contactsTable.projectId, projectId), eq(contactsTable.teamId, teamId)))
    .groupBy(contactsTable.id)
    .orderBy(desc(contactsTable.createdAt))
}

export async function getContactTotal({
  projectId,
  teamId,
}: {
  projectId: string
  teamId: string
}): Promise<number> {
  const [{ total }] = await db
    .select({
      total: count(contactsTable.id),
    })
    .from(contactsTable)
    .where(and(eq(contactsTable.projectId, projectId), eq(contactsTable.teamId, teamId)))

  return total
}

interface ContactFields {
  name: string
  type: string
  default: any | undefined
  enumValues: any[] | undefined
  length: number | undefined
  rules:
    | {
        isRequired: boolean
        isUnique: boolean
      }
    | undefined
}

export function getContactColumns(): ContactFields[] {
  const { columns } = getTableConfig(contactsTable)
  return columns
    .filter((col) => !SKIP_CONTACT_COLUMNS.includes(col.name))
    .map((col) => {
      return {
        name: col.name,
        type: col.dataType,
        default: col.default,
        enumValues: col.enumValues,
        length: (col as unknown as { length: number }).length,
        rules: {
          isRequired: col.notNull,
          isUnique: col.isUnique,
        },
      } as ContactFields
    })
}

export async function createContact(data: InsertContact): Promise<SelectContact> {
  return await db.insert(contactsTable).values(data).returning().get()
}

export async function deleteContact({ id }: { id: string }): Promise<void> {
  await db.delete(contactsTable).where(eq(contactsTable.id, id))
}

export async function isUniqContactEmail(email: string, projectId: string): Promise<boolean> {
  const obj = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(contactsTable)
    .where(and(eq(contactsTable.email, email), eq(contactsTable.projectId, projectId)))
    .get()

  return Number((obj ?? { exists: 0 }).exists) === 0
}

export async function hasContactPermission({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<boolean> {
  const [{ isAllowed }] = await db
    .select({
      isAllowed: sql<boolean>`
        EXISTS (
          SELECT 1
          FROM contacts c
          JOIN projects p ON c.project_id = p.id
          JOIN teams t ON p.team_id = t.id
          JOIN user_teams ut ON ut.team_id = t.id
          WHERE c.id = ${id}
          AND ut.user_id = ${userId}
          AND ut.role = 'owner'
        )
      `.as('isAllowed'),
    })
    .from(contactsTable)
    .limit(1)

  return Boolean(isAllowed)
}

export async function getUniqueContactEmails({
  emails,
  teamId,
  projectId,
}: {
  emails: string[]
  teamId: string
  projectId: string
}): Promise<string[]> {
  const finalUniqueEmails = [...new Set(emails)]

  const existingEmails = await db
    .select({ email: contactsTable.email })
    .from(contactsTable)
    .where(
      and(
        eq(contactsTable.teamId, teamId),
        eq(contactsTable.projectId, projectId),
        inArray(contactsTable.email, finalUniqueEmails)
      )
    )

  const existingEmailSet = new Set(existingEmails.map((contact) => contact.email))

  return finalUniqueEmails.filter((email) => !existingEmailSet.has(email))
}

export async function bulkCreateContactEmails({
  emails,
  teamId,
  projectId,
  userId,
}: {
  emails: string[]
  teamId: string
  projectId: string
  userId: string
}): Promise<void> {
  const data = emails.map((email) => {
    return { email, teamId, projectId, userId }
  })
  await db.insert(contactsTable).values(data)
}
