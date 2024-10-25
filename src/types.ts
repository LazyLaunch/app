import type { SHAHash } from 'oslo/crypto'
import type { JWTAlgorithm } from 'oslo/jwt'

export const JWT_ALGORITHM: JWTAlgorithm = 'HS256' as const
export const SHA_HASH: SHAHash = 'SHA-256' as const

export const GOOGLE_SCOPES = ['openid', 'profile', 'email'] as const
export const CSRF_TOKEN = 'csrfToken' as const
export const SLUG_RANDOM_STRING_SIZE = 8 as const

export const TOAST_ERROR_TIME = 5000 as const
export const TOAST_SUCCESS_TIME = 5000 as const

export type GoogleOAuthScope = (typeof GOOGLE_SCOPES)[number]

export enum ProviderTypeEnum {
  Oidc = 'oidc',
  Oauth = 'oauth',
  Email = 'email',
  Credentials = 'credentials',
}

export enum OauthKeyNameEnum {
  GoogleOauthState = 'google_oauth_state',
  GoogleOauthCodeVerifier = 'google_oauth_code_verifier',
  GoogleOauthFlow = 'google_oauth_flow',
}

export type ProviderType = `${ProviderTypeEnum}`
export type OauthKeyName = `${OauthKeyNameEnum}`

export enum UserFlowEnum {
  Signup = 'signup',
  Login = 'login',
}

export enum UserErrorFlowEnum {
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_NOT_FOUND = 'not_found',
  ACCOUNT_ALREADY_EXISTS = 'already_exists',
  INVALID_FLOW = 'invalid_flow',
}

export enum ResponseStatusMessageEnum {
  UNAUTHORIZED = 'User must be logged in.',
}

export enum ResponseStatusEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export enum ResponseCodeEnum {
  SUCCESS = 200,
  ERROR = 400,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
}

export const DEFAULT_PAGE_INDEX: number = 0 as const
export const DEFAULT_PAGE_SIZE: number = 10 as const
export const DEFAULT_MAX_PAGE_SIZE: number = 100 as const
export const DEFAULT_PAGE_SIZES: number[] = [
  DEFAULT_PAGE_SIZE,
  20,
  50,
  DEFAULT_MAX_PAGE_SIZE,
] as const

export enum ContactSourceEnum {
  FORM = 'form',
  API = 'api',
  APP = 'app',
}

export enum CustomFieldTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export const CUSTOM_FIELD_TYPE_LIST = [
  CustomFieldTypeEnum.TEXT,
  CustomFieldTypeEnum.NUMBER,
  CustomFieldTypeEnum.DATE,
  CustomFieldTypeEnum.BOOLEAN,
] as const
