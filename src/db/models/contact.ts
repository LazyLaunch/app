import { UTCDate } from '@date-fns/utc'

import { db } from '@/db'
import type { InsertContact, SelectContact, SelectCustomField } from '@/db/schema'
import { contactCustomFieldsTable, contactsTable, customFieldsTable } from '@/db/schema'
import type { CustomFieldTypeEnum } from '@/types'
import { endOfDay, getTime, startOfDay } from 'date-fns'
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  like,
  lte,
  or,
  sql,
  type InferSelectModel,
} from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

const SKIP_CONTACT_COLUMNS: string[] = ['team_id', 'project_id', 'user_id', 'id'] as const

export interface ContactCustomFields
  extends Pick<SelectCustomField, 'id' | 'name' | 'type' | 'tag'> {
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
  value: string | number | boolean | Array<string | number | boolean | null>
}>
export type ContactCustomColumnFilters = Array<{
  id: string
  value: string | number | boolean | Array<string | number | boolean | null>
}>
type AnyContactField = 'any'
export interface GlobalContactColumnFilter {
  id: 'string' | undefined
  field: ContactColumn | AnyContactField
  value: string | number
  isCustomField: boolean
}
export type ContactCustomFieldSort = { id: string; desc: boolean }

export async function getContacts({
  projectId,
  teamId,
  limit,
  offset,
  sortFields = [{ id: 'createdAt', desc: true }],
  columnFilters = [],
  customFieldsSorting = [],
  globalFilter = [],
  customColumnFilters = [],
}: {
  projectId: string
  teamId: string
  limit: number
  offset: number
  sortFields?: ContactSortFields
  columnFilters: ContactColumnFilters
  customColumnFilters: ContactCustomColumnFilters
  customFieldsSorting?: ContactCustomFieldSort[]
  globalFilter?: GlobalContactColumnFilter[]
}): Promise<ContactProps[]> {
  const dateColumnIds: Array<keyof typeof contactsTable> = ['createdAt', 'updatedAt']

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

  const filters = columnFilters
    .map((filter) => {
      const column = contactsTable[filter.id]

      if (Array.isArray(filter.value)) {
        if (['string', 'boolean'].includes(typeof filter.value[0])) {
          return inArray(column, filter.value as string[] | boolean[])
        }
        if (typeof filter.value[0] === 'number') {
          return or(...(filter.value as number[]).map((val) => eq(column as any, val)))
        }

        if (Array.isArray(filter.value[0]) && Array.isArray(filter.value[1])) {
          const obj = new Map<'type' | 'from' | 'to', CustomFieldTypeEnum | 'any'>(
            filter.value as Iterable<['type' | 'from' | 'to', CustomFieldTypeEnum | 'any']>
          )
          const from = obj.get('from') as string | null
          const to = obj.get('to') as string | null

          if (from && to && dateColumnIds.includes(filter.id)) {
            const dayStart = startOfDay(new UTCDate(from))
            const dayEnd = endOfDay(new UTCDate(to))

            return and(gte(column, dayStart), lte(column, dayEnd))
          }
        }
      }

      if (typeof filter.value === 'string') {
        return like(column, `%${filter.value}%`)
      }

      // return eq(column as any, filter.value)
    })
    .filter(Boolean)

  if (customColumnFilters?.length > 0) {
    const customFilterConditions = customColumnFilters
      .map((filter) => {
        if (Array.isArray(filter.value)) {
          if (filter.value.includes(true) || filter.value.includes(false)) {
            const values = filter.value.map((v) => String(v))

            return sql<boolean>`
              EXISTS (
                SELECT 1
                FROM ${contactCustomFieldsTable}
                WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
                  AND ${contactCustomFieldsTable.customFieldId} = ${filter.id}
                  AND ${contactCustomFieldsTable.value} IN (${sql.join(values, sql`, `)})
              )
            `
          }
          if (Array.isArray(filter.value[0]) && Array.isArray(filter.value[1])) {
            const obj = new Map<'from' | 'to', 'any'>(
              filter.value as Iterable<['from' | 'to', 'any']>
            )
            const from = obj.get('from') as string | null
            const to = obj.get('to') as string | null

            if (from && to) {
              const dayStart = getTime(startOfDay(new UTCDate(from)))
              const dayEnd = getTime(endOfDay(new UTCDate(to)))

              return sql<boolean>`
                EXISTS (
                  SELECT 1
                  FROM ${contactCustomFieldsTable}
                  WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
                    AND ${contactCustomFieldsTable.customFieldId} = ${filter.id}
                    AND CAST(${contactCustomFieldsTable.value} AS INTEGER) BETWEEN ${dayStart} AND ${dayEnd}
                )
              `
            }
          }
        }
      })
      .filter(Boolean)

    filters.push(...customFilterConditions)
  }

  if (globalFilter?.length > 0) {
    const globalConditions = globalFilter
      .map((filter) => {
        if (filter.field === 'any') {
          const contactFieldsCondition = or(
            like(contactsTable.email, `%${filter.value}%`),
            like(contactsTable.firstName, `%${filter.value}%`),
            like(contactsTable.lastName, `%${filter.value}%`)
          )

          const customFieldsCondition = sql<boolean>`
          EXISTS (
            SELECT 1
            FROM ${contactCustomFieldsTable}
            WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
            AND ${contactCustomFieldsTable.value} LIKE '%' || ${filter.value} || '%'
          )
        `

          return or(contactFieldsCondition, customFieldsCondition)
        }

        if (filter.isCustomField) {
          return sql<boolean>`
                EXISTS (
                  SELECT 1
                  FROM ${contactCustomFieldsTable}
                  WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
                  AND ${contactCustomFieldsTable.customFieldId} = ${filter.id}
                  AND ${contactCustomFieldsTable.value} LIKE '%' || ${filter.value} || '%'
                )
              `
        }

        return like(contactsTable[filter.field], `%${filter.value}%`)
      })
      .filter(Boolean)

    filters.push(...globalConditions)
  }

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
            'id', custom_fields.id,
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
  customFields: Record<string, string | boolean | number>
): Promise<SelectContact> {
  const ids: string[] = Object.keys(customFields)

  return await db.transaction(async (tx) => {
    const contact = await tx.insert(contactsTable).values(data).returning().get()
    if (ids.length === 0) return contact

    const contactCustomFieldData = ids.map((id) => {
      const value = customFields[id]

      return {
        customFieldId: id,
        contactId: contact.id,
        value: String(value),
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

export async function updateContact({
  id,
  projectId,
  customFields,
  ...data
}: Partial<InsertContact> & {
  id: string
  projectId: string
  customFields: Record<string, string | boolean | number> | undefined
}): Promise<void> {
  console.log(data, customFields, 'eeeeeee')

  await db
    .update(contactsTable)
    .set(data)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.projectId, projectId)))
}
