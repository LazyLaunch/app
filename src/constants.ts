import type { SHAHash } from 'oslo/crypto'
import type { JWTAlgorithm } from 'oslo/jwt'

import { ConditionType, CustomFieldTypeEnum, Operator } from '@/enums'

export const JWT_ALGORITHM: JWTAlgorithm = 'HS256' as const
export const SHA_HASH: SHAHash = 'SHA-256' as const

export const GOOGLE_SCOPES = ['openid', 'profile', 'email'] as const
export const CSRF_TOKEN = 'csrfToken' as const
export const SLUG_RANDOM_STRING_SIZE = 8 as const

export const TOAST_ERROR_TIME = 5000 as const
export const TOAST_SUCCESS_TIME = 5000 as const

export const DEFAULT_PAGE_INDEX: number = 0 as const
export const DEFAULT_PAGE_SIZE: number = 10 as const
export const DEFAULT_MAX_PAGE_SIZE: number = 100 as const
export const DEFAULT_PAGE_SIZES: number[] = [
  DEFAULT_PAGE_SIZE,
  20,
  50,
  DEFAULT_MAX_PAGE_SIZE,
] as const

export const CUSTOM_FIELD_TYPE_LIST = [
  CustomFieldTypeEnum.STRING,
  CustomFieldTypeEnum.NUMBER,
  CustomFieldTypeEnum.DATE,
  CustomFieldTypeEnum.BOOLEAN,
] as const

export const DATE_TEXT_FORMAT: string = 'LLL dd, y HH:mm:ss' as const

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
