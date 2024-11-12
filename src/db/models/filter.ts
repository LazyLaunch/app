import { UTCDate } from '@date-fns/utc'
import { endOfDay, startOfDay } from 'date-fns'
import { and, eq, isNotNull, isNull, like, ne, notLike, or, sql, type SQL } from 'drizzle-orm'

import { contactCustomFieldsTable, contactsTable, customFieldsTable } from '@/db/schema'

import { snakeToCamel } from '@/lib/utils'
import { CustomFieldTypeEnum } from '@/types'

import type { ContactColumn, ContactFields } from '@/db/models/contact'
import type { SelectFilterCondition } from '@/db/schema'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'

export enum Operator {
  EQUALS = 0,
  NOT_EQUAL = 1,
  CONTAINS = 2,
  NOT_CONTAIN = 3,
  IS_EMPTY = 4,
  IS_NOT_EMPTY = 5,
  IS_TRUE = 6,
  IS_FALSE = 7,
  IS_AFTER = 8,
  IS_BEFORE = 9,
  BETWEEN = 10,
  GREATER_THAN = 11,
  LESS_THAN = 12,
}

export enum ConditionType {
  AND = 0,
  OR = 1,
}

export const OPERATOR_NAMES: Record<Operator, string> = {
  [Operator.EQUALS]: 'Equals',
  [Operator.NOT_EQUAL]: 'Does not equal',
  [Operator.CONTAINS]: 'Contains',
  [Operator.NOT_CONTAIN]: 'Does not contain',
  [Operator.IS_EMPTY]: 'Is empty',
  [Operator.IS_NOT_EMPTY]: 'Is not empty',
  [Operator.IS_TRUE]: 'Is true',
  [Operator.IS_FALSE]: 'Is false',
  [Operator.IS_AFTER]: 'Is after',
  [Operator.IS_BEFORE]: 'Is before',
  [Operator.BETWEEN]: 'Between',
  [Operator.GREATER_THAN]: 'Greater than',
  [Operator.LESS_THAN]: 'Less than',
} as const

export const OPERATORS_BY_COL_TYPE: Record<CustomFieldTypeEnum, Operator[]> = {
  [CustomFieldTypeEnum.STRING]: [
    Operator.EQUALS,
    Operator.NOT_EQUAL,
    Operator.CONTAINS,
    Operator.NOT_CONTAIN,
    Operator.IS_EMPTY,
    Operator.IS_NOT_EMPTY,
  ],
  [CustomFieldTypeEnum.BOOLEAN]: [
    Operator.IS_EMPTY,
    Operator.IS_NOT_EMPTY,
    Operator.IS_TRUE,
    Operator.IS_FALSE,
  ],
  [CustomFieldTypeEnum.DATE]: [
    Operator.IS_EMPTY,
    Operator.IS_NOT_EMPTY,
    Operator.IS_AFTER,
    Operator.IS_BEFORE,
    Operator.BETWEEN,
  ],
  [CustomFieldTypeEnum.NUMBER]: [
    Operator.EQUALS,
    Operator.NOT_EQUAL,
    Operator.IS_EMPTY,
    Operator.IS_NOT_EMPTY,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
  ],
  [CustomFieldTypeEnum.ENUM]: [Operator.EQUALS, Operator.NOT_EQUAL],
}

export const DEFAULT_FILTER: Record<CustomFieldTypeEnum, Operator> = {
  [CustomFieldTypeEnum.STRING]: Operator.CONTAINS,
  [CustomFieldTypeEnum.BOOLEAN]: Operator.IS_TRUE,
  [CustomFieldTypeEnum.DATE]: Operator.IS_AFTER,
  [CustomFieldTypeEnum.NUMBER]: Operator.EQUALS,
  [CustomFieldTypeEnum.ENUM]: Operator.EQUALS,
}

export const CONDITION_TYPES: Record<ConditionType, string> = {
  [ConditionType.AND]: 'and',
  [ConditionType.OR]: 'or',
} as const

export interface FilterCondition
  extends Omit<SelectFilterCondition, 'id' | 'createdAt' | 'filterId' | 'columnType'> {
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

function buildConditions({
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

  const conditions = buildConditions({ filterConditions, contactFields, teamId, projectId })
  return buildGroupConditions({ conditions, filterConditions })
}
