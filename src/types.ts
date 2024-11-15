import type { GOOGLE_SCOPES } from '@/constants'
import type { OauthKeyNameEnum, ProviderTypeEnum } from '@/enums'

export type GoogleOAuthScope = (typeof GOOGLE_SCOPES)[number]

export type ProviderType = `${ProviderTypeEnum}`
export type OauthKeyName = `${OauthKeyNameEnum}`

export type ContactNavLinkId = 'contacts' | 'fields'
