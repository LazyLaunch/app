import { db } from '@/db'
import type { InsertContact, SelectContact, SelectCustomField } from '@/db/schema'
import { contactCustomFieldsTable, contactsTable, customFieldsTable } from '@/db/schema'
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  like,
  or,
  sql,
  type InferSelectModel,
} from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

const SKIP_CONTACT_COLUMNS: string[] = ['team_id', 'project_id', 'user_id', 'id'] as const

export interface ContactCustomFields extends Pick<SelectCustomField, 'name' | 'type' | 'tag'> {
  value: string | null
}

interface ExtendedContact extends SelectContact {
  customFields: ContactCustomFields[]
}

export interface ContactProps
  extends Omit<ExtendedContact, 'updatedAt' | 'createdAt' | 'projectId' | 'teamId' | 'userId'> {}

type ContactColumn = keyof InferSelectModel<typeof contactsTable>
export type ContactSortFields = Array<{ id: ContactColumn; desc: boolean }>
export type ContactColumnFilters = Array<{
  id: ContactColumn
  value: string | number | boolean | Array<string | number | boolean>
}>
export type ContactCustomFieldSort = { id: string; desc: boolean }

export async function getContacts({
  projectId,
  teamId,
  limit,
  offset,
  sortFields = [{ id: 'createdAt', desc: true }],
  columnFilters = [],
  customFieldsSorting = [],
}: {
  projectId: string
  teamId: string
  limit: number
  offset: number
  sortFields?: ContactSortFields
  columnFilters: ContactColumnFilters
  customFieldsSorting?: ContactCustomFieldSort[]
}): Promise<ContactProps[]> {
  const sortBy = sortFields.map((field) =>
    field.desc ? desc(contactsTable[field.id]) : asc(contactsTable[field.id])
  )

  for (const customFieldSort of customFieldsSorting) {
    const customSortCondition = sql`
      (SELECT value
       FROM ${contactCustomFieldsTable}
       WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
       AND ${contactCustomFieldsTable.customFieldId} = ${customFieldSort.id})
    `

    const sort = customFieldSort.desc ? desc(customSortCondition) : asc(customSortCondition)
    sortBy.push(sort)
  }

  const filters = columnFilters.map((filter) => {
    const column = contactsTable[filter.id]

    if (Array.isArray(filter.value)) {
      if (['string', 'boolean'].includes(typeof filter.value[0])) {
        return inArray(column, filter.value as string[] | boolean[])
      }
      if (typeof filter.value[0] === 'number') {
        return or(...(filter.value as number[]).map((val) => eq(column as any, val)))
      }
    }

    if (typeof filter.value === 'string') {
      return like(column, `%${filter.value}%`)
    }

    return eq(column as any, filter.value)
  })

  const whereConditions = and(
    eq(contactsTable.projectId, projectId),
    eq(contactsTable.teamId, teamId),
    ...filters
  )

  const results = await db
    .select({
      id: contactsTable.id,
      email: contactsTable.email,
      firstName: contactsTable.firstName,
      lastName: contactsTable.lastName,
      subscribed: contactsTable.subscribed,
      source: contactsTable.source,
      updatedAt: contactsTable.updatedAt,
      createdAt: contactsTable.createdAt,
      customFields: sql<ContactCustomFields[]>`
        json_group_array(
          json_object(
            'name', custom_fields.name,
            'type', custom_fields.type,
            'tag', custom_fields.tag,
            'value', COALESCE(contact_custom_fields.value, '')
          )
        )
      `.as('custom_fields'),
    })
    .from(contactsTable)
    .leftJoin(contactCustomFieldsTable, eq(contactsTable.id, contactCustomFieldsTable.contactId))
    .leftJoin(
      customFieldsTable,
      or(
        isNull(contactCustomFieldsTable.customFieldId),
        eq(customFieldsTable.id, contactCustomFieldsTable.customFieldId)
      )
    )
    .where(whereConditions)
    .groupBy(contactsTable.id)
    .orderBy(...sortBy)
    .limit(limit)
    .offset(offset)

  return results
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

export async function createContact(
  data: InsertContact,
  customFields: Record<string, string>
): Promise<SelectContact> {
  const ids: string[] = Object.keys(customFields)

  return await db.transaction(async (tx) => {
    const contact = await tx.insert(contactsTable).values(data).returning().get()

    const contactCustomFieldData = ids.map((id) => {
      const value = customFields[id]

      return {
        customFieldId: id,
        contactId: contact.id,
        value,
      }
    })

    await tx.insert(contactCustomFieldsTable).values(contactCustomFieldData)

    return contact
  })
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
