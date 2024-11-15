import { UTCDate } from '@date-fns/utc'
import { endOfDay, startOfDay } from 'date-fns'
import { and, eq, isNotNull, isNull, like, ne, notLike, or, sql, type SQL } from 'drizzle-orm'

import {
  contactCustomFieldsTable,
  contactsTable,
  customFieldsTable,
  filterConditionsTable,
  filtersTable,
} from '@/db/schema'

import { db } from '@/db'
import { snakeToCamel } from '@/lib/utils'

import { ConditionType, CustomFieldTypeEnum, Operator } from '@/enums'

import type { ContactColumn, ContactFields } from '@/db/models/contact'
import type { InsertFilterCondition, SelectFilterCondition } from '@/db/schema'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'

export interface FilterCondition
  extends Omit<SelectFilterCondition, 'id' | 'createdAt' | 'filterId' | 'columnType'> {
  filterId?: string
  columnType: CustomFieldTypeEnum
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

    if (conditionType === ConditionType.AND) {
      currentAndGroup.push(condition)
    } else if (conditionType === ConditionType.OR) {
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
        return filterCondition.operator === Operator.IS_EMPTY
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
    case Operator.EQUALS:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(isNotNull(column), ne(column, ''), eq(column, String(value)))
    case Operator.NOT_EQUAL: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(isNotNull(column), ne(column, ''), ne(column, String(value)))
    }
    case Operator.CONTAINS:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return like(column, `%${value}%`)
    case Operator.NOT_CONTAIN:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return and(notLike(column, `%${value}%`), ne(column, ''), isNotNull(column))
    case Operator.IS_EMPTY:
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
    case Operator.IS_NOT_EMPTY:
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
    case Operator.IS_TRUE:
      if (isCustomField && columnType === CustomFieldTypeEnum.BOOLEAN) return eq(column, 'true')
      return eq(column, true)
    case Operator.IS_FALSE:
      if (isCustomField && columnType === CustomFieldTypeEnum.BOOLEAN) return eq(column, 'false')
      return eq(column, false)
    case Operator.IS_AFTER: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      const dayEnd = endOfDay(new UTCDate(Number(value)))

      return sql`CAST(${column} AS INTEGER) > ${dayEnd} AND ${column} IS NOT NULL AND ${column} != ''`
    }
    case Operator.IS_BEFORE: {
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      const dayStart = startOfDay(new UTCDate(Number(value)))

      return sql`CAST(${column} AS INTEGER) < ${dayStart} AND ${column} IS NOT NULL AND ${column} != ''`
    }
    case Operator.BETWEEN: {
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
    case Operator.GREATER_THAN:
      if (['null', 'undefiend', ''].includes(String(value))) return undefined
      return sql`CAST(${column} AS INTEGER) > ${Number(value)} AND ${column} IS NOT NULL AND ${column} != ''`
    case Operator.LESS_THAN:
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

export async function saveFilters({
  filterConditions,
  teamId,
  projectId,
  userId,
  filterId,
  filterName,
}: {
  filterConditions: InsertFilterCondition[]
  teamId: string
  projectId: string
  userId: string
  filterId?: string | undefined
  filterName: string
}) {
  return await db.transaction(async (tx) => {
    const filter = await tx
      .insert(filtersTable)
      .values({
        teamId,
        projectId,
        userId,
        name: filterName,
        id: filterId,
      })
      .onConflictDoUpdate({
        target: filtersTable.id,
        set: { name: filterName },
        setWhere: sql`projectId = ${projectId} AND teamId = ${teamId}`,
      })
      .returning()
      .get()

    const conditions = filterConditions.map(async (condition) => {
      const { id, ...rest } = condition
      await tx
        .insert(filterConditionsTable)
        .values(condition)
        .onConflictDoUpdate({
          target: filterConditionsTable.id,
          set: { ...rest, filterId: filter.id },
          setWhere: sql`projectId = ${projectId} AND teamId = ${teamId} AND filterId = ${filter.id}`,
        })
        .returning()
        .get()
    })

    return { filter, conditions }
  })
}
