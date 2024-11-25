import { UTCDate } from '@date-fns/utc'
import { endOfDay, startOfDay } from 'date-fns'
import {
  and,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  ne,
  notLike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'

import {
  contactCustomFieldsTable,
  contactsTable,
  customFieldsTable,
  filterConditionsTable,
  filtersTable,
} from '@/db/schema'

import { db } from '@/db'
import { snakeToCamel } from '@/lib/utils'

import { ConditionTypeEnum, CustomFieldTypeEnum, OperatorEnum } from '@/enums'

import type { ContactColumn, ContactFields } from '@/db/models/contact'
import type {
  InsertFilter,
  InsertFilterCondition,
  SelectFilter,
  SelectFilterCondition,
} from '@/db/schema'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'

export type FilterConditionColumnType = Exclude<CustomFieldTypeEnum, CustomFieldTypeEnum.ENUM>
export interface FilterCondition
  extends Omit<SelectFilterCondition, 'id' | 'createdAt' | 'filterId' | 'columnType'> {
  id?: string
  filterId?: string | undefined
  columnType: FilterConditionColumnType
}

const createExistsQuery = (subquery: SQL<any>) => sql<boolean>`EXISTS (${subquery})`
const buildEmptyQuery = ({
  teamId,
  projectId,
  colId,
  condition,
}: {
  colId: string
  teamId: string
  projectId: string
  condition: SQL<any>
}) =>
  sql<boolean>`
    CASE
      WHEN ${createExistsQuery(sql`
        SELECT 1
        FROM ${contactCustomFieldsTable}
        WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
        AND ${contactCustomFieldsTable.customFieldId} = ${colId}
      `)}
      THEN ${createExistsQuery(sql`
        SELECT 1
        FROM ${contactCustomFieldsTable}
        WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
        AND ${contactCustomFieldsTable.customFieldId} = ${colId}
        AND ${condition}
      `)}
      ELSE ${createExistsQuery(sql`
        SELECT 1
        FROM ${customFieldsTable}
        WHERE ${customFieldsTable.teamId} = ${teamId}
        AND ${customFieldsTable.projectId} = ${projectId}
        AND ${customFieldsTable.id} = ${colId}
      `)}
    END
  `

function buildGroupConditions({
  filterConditions,
  conditions,
}: {
  filterConditions: FilterCondition[]
  conditions: SQL<any>[]
}): SQL<any> | undefined {
  let combinedCondition: SQL<any> | undefined
  let currentAndGroup: SQL<any>[] = []

  for (let i = 0; i < filterConditions.length; i++) {
    const condition = conditions[i]
    const conditionType = filterConditions[i].conditionType

    if (conditionType === ConditionTypeEnum.AND) {
      currentAndGroup.push(condition)
    } else if (conditionType === ConditionTypeEnum.OR) {
      const andGroup = currentAndGroup.length > 1 ? and(...currentAndGroup) : currentAndGroup[0]
      combinedCondition = combinedCondition ? or(combinedCondition, andGroup) : andGroup
      currentAndGroup = [condition]
    }
  }

  if (currentAndGroup.length) {
    const finalAndGroup = currentAndGroup.length > 1 ? and(...currentAndGroup) : currentAndGroup[0]
    combinedCondition = combinedCondition ? or(combinedCondition, finalAndGroup) : finalAndGroup
  }

  return combinedCondition
}

function buildColumn({
  filterCondition,
  contactFields,
}: {
  filterCondition: FilterCondition
  contactFields: ContactFields[]
}) {
  const isCustomField = !contactFields.find((f) => f.name === filterCondition.columnName)
  const colId = isCustomField
    ? filterCondition.columnName
    : snakeToCamel(filterCondition.columnName)
  const column = isCustomField
    ? contactCustomFieldsTable.value
    : contactsTable[colId as ContactColumn]
  if (!column) throw new Error(`Column '${colId}' not found in table schema.`)
  return { isCustomField, colId, column }
}

function getConditions({
  filterConditions,
  projectId,
  teamId,
  contactFields,
}: {
  filterConditions: FilterCondition[]
  projectId: string
  teamId: string
  contactFields: ContactFields[]
}): SQL<any>[] {
  return filterConditions
    .map((filterCondition) => {
      const { isCustomField, colId, column } = buildColumn({ filterCondition, contactFields })
      const condition = buildCondition({
        filterCondition,
        column,
        isCustomField: true,
        columnType: filterCondition.columnType,
      })

      if (isCustomField && condition) {
        return filterCondition.operator === OperatorEnum.IS_EMPTY
          ? buildEmptyQuery({ projectId, teamId, condition, colId })
          : createExistsQuery(sql`
          SELECT 1
          FROM ${contactCustomFieldsTable}
          WHERE ${contactCustomFieldsTable.contactId} = ${contactsTable.id}
          AND ${contactCustomFieldsTable.customFieldId} = ${colId}
          AND ${condition}
        `)
      }

      return buildCondition({ filterCondition, column, columnType: filterCondition.columnType })
    })
    .filter(Boolean) as SQL<any>[]
}

function buildCondition({
  filterCondition,
  column,
  isCustomField = false,
  columnType,
}: {
  filterCondition: FilterCondition
  column: SQLiteColumn
  isCustomField?: boolean
  columnType: CustomFieldTypeEnum
}): SQL<any | undefined> | undefined {
  const { operator, value, secondaryValue } = filterCondition

  switch (operator) {
    case OperatorEnum.EQUALS:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(isNotNull(column), ne(column, ''), eq(column, String(value)))
    case OperatorEnum.NOT_EQUAL: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(isNotNull(column), ne(column, ''), ne(column, String(value)))
    }
    case OperatorEnum.CONTAINS:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return like(column, `%${value}%`)
    case OperatorEnum.NOT_CONTAIN:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(notLike(column, `%${value}%`), ne(column, ''), isNotNull(column))
    case OperatorEnum.IS_EMPTY:
      if (
        !isCustomField &&
        [
          CustomFieldTypeEnum.BOOLEAN,
          CustomFieldTypeEnum.NUMBER,
          CustomFieldTypeEnum.DATE,
        ].includes(columnType)
      ) {
        return sql`CAST(${column} AS INTEGER) IS NULL OR CAST(${column} AS INTEGER) == ''`
      }
      return or(eq(column, ''), isNull(column)) as SQL
    case OperatorEnum.IS_NOT_EMPTY:
      if (
        !isCustomField &&
        [
          CustomFieldTypeEnum.BOOLEAN,
          CustomFieldTypeEnum.NUMBER,
          CustomFieldTypeEnum.DATE,
        ].includes(columnType)
      ) {
        return sql`CAST(${column} AS INTEGER) IS NOT NULL AND CAST(${column} AS INTEGER) != ''`
      }
      return and(ne(column, ''), isNotNull(column)) as SQL
    case OperatorEnum.IS_TRUE:
      if (isCustomField && columnType === CustomFieldTypeEnum.BOOLEAN) return eq(column, 'true')
      return eq(column, true)
    case OperatorEnum.IS_FALSE:
      if (isCustomField && columnType === CustomFieldTypeEnum.BOOLEAN) return eq(column, 'false')
      return eq(column, false)
    case OperatorEnum.IS_AFTER: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      const dayEnd = endOfDay(new UTCDate(Number(value)))

      return sql`CAST(${column} AS INTEGER) > ${dayEnd} AND ${column} IS NOT NULL AND ${column} != ''`
    }
    case OperatorEnum.IS_BEFORE: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      const dayStart = startOfDay(new UTCDate(Number(value)))

      return sql`CAST(${column} AS INTEGER) < ${dayStart} AND ${column} IS NOT NULL AND ${column} != ''`
    }
    case OperatorEnum.BETWEEN: {
      if (
        ['null', 'undefiend', ''].includes(String(value)) ||
        ['null', 'undefiend', ''].includes(String(secondaryValue))
      ) {
        return undefined
      }

      const dayStart = startOfDay(new UTCDate(Number(value)))
      const dayEnd = endOfDay(new UTCDate(Number(secondaryValue)))

      return sql`CAST(${column} AS INTEGER) BETWEEN ${dayStart} AND ${dayEnd} AND ${column} IS NOT NULL AND ${column} != ''`
    }
    case OperatorEnum.GREATER_THAN:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return sql`CAST(${column} AS INTEGER) > ${Number(value)} AND ${column} IS NOT NULL AND ${column} != ''`
    case OperatorEnum.LESS_THAN:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return sql`CAST(${column} AS INTEGER) < ${Number(value)} AND ${column} IS NOT NULL AND ${column} != ''`
    default:
      throw new Error(`Unsupported operator: ${operator}`)
  }
}

export function buildDynamicFilter({
  filterConditions,
  teamId,
  projectId,
  contactFields,
}: {
  filterConditions: FilterCondition[]
  teamId: string
  projectId: string
  contactFields: ContactFields[]
}): SQL<any> | undefined {
  if (!filterConditions.length) return undefined

  const conditions = getConditions({ filterConditions, contactFields, teamId, projectId })
  return buildGroupConditions({ conditions, filterConditions })
}

export interface ExtendedFilterCondition extends Omit<InsertFilterCondition, 'filterId'> {
  filterId: string | SQL<undefined>
  columnType: FilterConditionColumnType
}

interface ExtendedFilter extends InsertFilter {
  filterConditions: ExtendedFilterCondition[]
  deleteFilterConditionIds: string[]
}

export async function saveFilters({
  deleteFilterConditionIds,
  filterConditions,
  teamId,
  projectId,
  userId,
  id,
  name,
}: ExtendedFilter): Promise<{
  filter: Pick<SelectFilter, 'id' | 'name'>
  filterConditions: SelectFilterCondition[]
}> {
  return await db.transaction(async (tx) => {
    const filter = await tx
      .insert(filtersTable)
      .values({
        teamId,
        projectId,
        userId,
        name,
        id,
      })
      .onConflictDoUpdate({
        target: filtersTable.id,
        set: { name },
        setWhere: sql`project_id = ${projectId} AND team_id = ${teamId}`,
      })
      .returning()
      .get()

    const conditions = []
    for (const condition of filterConditions) {
      const { id: conditionId, ...rest } = condition
      const newCondition = await tx
        .insert(filterConditionsTable)
        .values({ ...condition, filterId: filter.id })
        .onConflictDoUpdate({
          target: filterConditionsTable.id,
          set: { ...rest, filterId: filter.id },
          setWhere: sql`filter_id = ${filter.id}`,
        })
        .returning()
        .get()

      conditions.push(newCondition)
    }
    await tx
      .delete(filterConditionsTable)
      .where(
        and(
          eq(filterConditionsTable.filterId, filter.id),
          inArray(filterConditionsTable.id, deleteFilterConditionIds)
        )
      )

    return { filter: { id: filter.id, name: filter.name }, filterConditions: conditions }
  })
}

export async function isUniqFilterName({
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
    .from(filtersTable)
    .where(
      and(
        eq(filtersTable.name, name),
        eq(filtersTable.projectId, projectId),
        eq(filtersTable.teamId, teamId)
      )
    )
    .get()

  return Number((obj ?? { exists: 0 }).exists) === 0
}

export async function getFilterConditions({
  filterId,
}: {
  filterId: string
}): Promise<SelectFilterCondition[]> {
  return await db
    .select()
    .from(filterConditionsTable)
    .where(eq(filterConditionsTable.filterId, filterId))
}
