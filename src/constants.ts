import type { SHAHash } from 'oslo/crypto'
import type { JWTAlgorithm } from 'oslo/jwt'

import { ConditionTypeEnum, CustomFieldTypeEnum, OperatorEnum } from '@/enums'

export const CUID_LENGTH: number = 32 as const

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

export const OPERATOR_NAMES: Record<OperatorEnum, string> = {
  [OperatorEnum.EQUALS]: 'Equals',
  [OperatorEnum.NOT_EQUAL]: 'Does not equal',
  [OperatorEnum.CONTAINS]: 'Contains',
  [OperatorEnum.NOT_CONTAIN]: 'Does not contain',
  [OperatorEnum.IS_EMPTY]: 'Is empty',
  [OperatorEnum.IS_NOT_EMPTY]: 'Is not empty',
  [OperatorEnum.IS_TRUE]: 'Is true',
  [OperatorEnum.IS_FALSE]: 'Is false',
  [OperatorEnum.IS_AFTER]: 'Is after',
  [OperatorEnum.IS_BEFORE]: 'Is before',
  [OperatorEnum.BETWEEN]: 'Between',
  [OperatorEnum.GREATER_THAN]: 'Greater than',
  [OperatorEnum.LESS_THAN]: 'Less than',
} as const

export const OPERATORS_BY_COL_TYPE: Record<CustomFieldTypeEnum, OperatorEnum[]> = {
  [CustomFieldTypeEnum.STRING]: [
    OperatorEnum.EQUALS,
    OperatorEnum.NOT_EQUAL,
    OperatorEnum.CONTAINS,
    OperatorEnum.NOT_CONTAIN,
    OperatorEnum.IS_EMPTY,
    OperatorEnum.IS_NOT_EMPTY,
  ],
  [CustomFieldTypeEnum.BOOLEAN]: [
    OperatorEnum.IS_EMPTY,
    OperatorEnum.IS_NOT_EMPTY,
    OperatorEnum.IS_TRUE,
    OperatorEnum.IS_FALSE,
  ],
  [CustomFieldTypeEnum.DATE]: [
    OperatorEnum.IS_EMPTY,
    OperatorEnum.IS_NOT_EMPTY,
    OperatorEnum.IS_AFTER,
    OperatorEnum.IS_BEFORE,
    OperatorEnum.BETWEEN,
  ],
  [CustomFieldTypeEnum.NUMBER]: [
    OperatorEnum.EQUALS,
    OperatorEnum.NOT_EQUAL,
    OperatorEnum.IS_EMPTY,
    OperatorEnum.IS_NOT_EMPTY,
    OperatorEnum.GREATER_THAN,
    OperatorEnum.LESS_THAN,
  ],
  [CustomFieldTypeEnum.ENUM]: [OperatorEnum.EQUALS, OperatorEnum.NOT_EQUAL],
}

export const DEFAULT_FILTER: Record<CustomFieldTypeEnum, OperatorEnum> = {
  [CustomFieldTypeEnum.STRING]: OperatorEnum.CONTAINS,
  [CustomFieldTypeEnum.BOOLEAN]: OperatorEnum.IS_TRUE,
  [CustomFieldTypeEnum.DATE]: OperatorEnum.IS_AFTER,
  [CustomFieldTypeEnum.NUMBER]: OperatorEnum.EQUALS,
  [CustomFieldTypeEnum.ENUM]: OperatorEnum.EQUALS,
}

export const CONDITION_TYPES: Record<ConditionTypeEnum, string> = {
  [ConditionTypeEnum.AND]: 'and',
  [ConditionTypeEnum.OR]: 'or',
} as const

export const CONTACT_DEFAULT_SEARCH_FIELD: string = 'any' as const
export const CONTACT_GLOBAL_SEARCH_FIELDS: string[] = ['email', 'firstName', 'lastName'] as const
