import type { z as AstroZ } from 'astro:schema'
import type { z as ZodZ } from 'zod'

import type { GOOGLE_SCOPES } from '@/constants'
import type { OauthKeyNameEnum, ProviderTypeEnum } from '@/enums'

export type GoogleOAuthScope = (typeof GOOGLE_SCOPES)[number]

export type ProviderType = `${ProviderTypeEnum}`
export type OauthKeyName = `${OauthKeyNameEnum}`

export type ContactNavLinkId = 'contacts' | 'fields' | 'segments' | 'groups'

export type ZNamespace = typeof AstroZ | typeof ZodZ
