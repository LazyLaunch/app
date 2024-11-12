import { UTCDate } from '@date-fns/utc'
import { endOfDay, getTime, startOfDay } from 'date-fns'
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  inArray,
  isNull,
  like,
  lte,
  or,
  sql,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

import { db } from '@/db'
import type { InsertContact, SelectContact, SelectCustomField } from '@/db/schema'
import { contactCustomFieldsTable, contactsTable, customFieldsTable } from '@/db/schema'

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

export type ContactColumn = keyof InferSelectModel<typeof contactsTable>
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

const DATE_COLUMN_IDS: Array<keyof typeof contactsTable> = ['createdAt', 'updatedAt'] as const
const CUSTOM_FIELDS = sql<ContactCustomFields[]>`
  json_group_array(
    json_object(
      'id', custom_fields.id,
      'name', custom_fields.name,
      'type', custom_fields.type,
      'tag', custom_fields.tag,
      'value', COALESCE(contact_custom_fields.value, '')
    )
  )`.as('custom_fields')

function buildGlobalFilters(globalFilter: GlobalContactColumnFilter[]) {
  return globalFilter.map((filter) => {
    if (filter.field === 'any') {
      const contactFields = or(
        like(contactsTable.email, `%${filter.value}%`),
        like(contactsTable.firstName, `%${filter.value}%`),
        like(contactsTable.lastName, `%${filter.value}%`)
      )

      // TODO: Needs to ignore date value
      const customFields = exists(
        db
          .select({ results: sql`1` })
          .from(contactCustomFieldsTable)
          .where(
            and(
              eq(contactCustomFieldsTable.contactId, contactsTable.id),
              like(contactCustomFieldsTable.value, `%${filter.value}%`)
            )
          )
      )
      return or(contactFields, customFields)
    }

    if (filter.isCustomField) {
      return exists(
        db
          .select({ results: sql`1` })
          .from(contactCustomFieldsTable)
          .where(
            and(
              eq(contactCustomFieldsTable.contactId, contactsTable.id),
              eq(contactCustomFieldsTable.customFieldId, filter.id as string),
              like(contactCustomFieldsTable.value, `%${filter.value}%`)
            )
          )
      )
    }
    return like(contactsTable[filter.field], `%${filter.value}%`)
  })
}

function buildDateRange(value: (string | number | null)[][]): {
  start: UTCDate | null
  end: UTCDate | null
} {
  const obj = new Map<'from' | 'to', number | null>(
    value as Iterable<['from' | 'to', number | null]>
  )
  const from = obj.get('from') as number | null
  const to = obj.get('to') as number | null

  const start = from ? startOfDay(new UTCDate(from)) : null
  const end = to ? endOfDay(new UTCDate(to)) : null
  return { start, end }
}

function buildColumnFilters(columnFilters: ContactColumnFilters): (SQL<any> | undefined)[] {
  return columnFilters.map((filter) => {
    const column = contactsTable[filter.id]
    if (Array.isArray(filter.value)) {
      if (['string', 'boolean'].includes(typeof filter.value[0])) {
        return inArray(column, filter.value as string[] | boolean[])
      }

      if (typeof filter.value[0] === 'number') {
        return inArray(column as any, filter.value as number[])
      }

      if (Array.isArray(filter.value[0]) && Array.isArray(filter.value[1])) {
        const value: (string | number | null)[][] = filter.value as unknown as (
          | string
          | number
          | null
        )[][]
        const { start, end } = buildDateRange(value)

        if (start && end && DATE_COLUMN_IDS.includes(filter.id)) {
          return and(gte(column, start), lte(column, end))
        }
      }
    }
  })
}

const buildCustomFilters = (customColumnFilters: ContactCustomColumnFilters) => {
  return customColumnFilters.map((filter) => {
    if (Array.isArray(filter.value)) {
      if (filter.value.includes(true) || filter.value.includes(false)) {
        const values = filter.value.map((v) => String(v))

        return exists(
          db
            .select({ results: sql`1` })
            .from(contactCustomFieldsTable)
            .where(
              and(
                eq(contactCustomFieldsTable.contactId, contactsTable.id),
                eq(contactCustomFieldsTable.customFieldId, filter.id),
                inArray(contactCustomFieldsTable.value, values)
              )
            )
        )
      }

      if (Array.isArray(filter.value[0]) && Array.isArray(filter.value[1])) {
        const value: (string | number | null)[][] = filter.value as unknown as (
          | string
          | number
          | null
        )[][]
        const { start, end } = buildDateRange(value)

        if (start && end) {
          const dayStart = getTime(start)
          const dayEnd = getTime(end)

          return exists(
            db
              .select({ results: sql`1` })
              .from(contactCustomFieldsTable)
              .where(
                and(
                  eq(contactCustomFieldsTable.contactId, contactsTable.id),
                  eq(contactCustomFieldsTable.customFieldId, filter.id),
                  sql`CAST(${contactCustomFieldsTable.value} AS INTEGER) BETWEEN ${dayStart} AND ${dayEnd}`
                )
              )
          )
        }
      }
    }
  })
}

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
  const sortBy = [
    ...sortFields.map((field) =>
      field.desc ? desc(contactsTable[field.id]) : asc(contactsTable[field.id])
    ),
    ...customFieldsSorting.map((field) => {
      const customSort = db
        .select({ value: contactCustomFieldsTable.value })
        .from(contactCustomFieldsTable)
        .where(
          and(
            eq(contactCustomFieldsTable.contactId, contactsTable.id),
            eq(contactCustomFieldsTable.customFieldId, field.id)
          )
        )
      return field.desc ? desc(customSort) : asc(customSort)
    }),
  ]

  const whereConditions = [
    eq(contactsTable.projectId, projectId),
    eq(contactsTable.teamId, teamId),
    ...buildColumnFilters(columnFilters),
    ...buildCustomFilters(customColumnFilters),
    ...buildGlobalFilters(globalFilter),
  ]

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
      customFields: CUSTOM_FIELDS,
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
    .where(and(...whereConditions))
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

export interface ContactFields {
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

export function getContactFields(): ContactFields[] {
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
  const timestampNow = getTime(new UTCDate())

  return await db.transaction(async (tx) => {
    await tx
      .update(contactsTable)
      .set({ ...data, updatedAt: sql`${timestampNow}` })
      .where(and(eq(contactsTable.id, id), eq(contactsTable.projectId, projectId)))

    if (customFields) {
      const fieldIds = Object.keys(customFields)
      for (const fieldId of fieldIds) {
        await tx
          .insert(contactCustomFieldsTable)
          .values({ value: String(customFields[fieldId]), contactId: id, customFieldId: fieldId })
          .onConflictDoUpdate({
            target: [contactCustomFieldsTable.contactId, contactCustomFieldsTable.customFieldId],
            set: { value: String(customFields[fieldId]) },
          })
      }
    }
  })
}

export async function testContacts({ conditions, projectId, teamId }) {
  const whereConditions = and(
    eq(contactsTable.projectId, projectId),
    eq(contactsTable.teamId, teamId),
    conditions
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
      customFields: CUSTOM_FIELDS,
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
    .orderBy(desc(contactsTable.createdAt))
    .groupBy(contactsTable.id)
    .limit(10)

  return results
}
