import type { TElement } from '@udecode/slate'
import { map } from 'nanostores'

export interface EmailTemplateSettings {
  bgColor: string
  bodyColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  bgVPadding: number
  bodyVPadding: number
  bgHPadding: number
  bodyHPadding: number
}

export interface EmojiProps {
  id: string
  name: string
  keywords: string[]
  native: string
  shortcodes: string
  unified: string
}

export interface ContentProps extends TElement {
  id: string
}

export interface EmailTemplateProps {
  name: string
  description?: string
  content?: ContentProps[]
  emoji: EmojiProps
  settings: EmailTemplateSettings
}

export const DEFAULT_SETTINGS: EmailTemplateSettings = {
  bgColor: 'transparent',
  bodyColor: 'transparent',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 4,
  bgVPadding: 0,
  bodyVPadding: 0,
  bgHPadding: 0,
  bodyHPadding: 0,
} as const

export const DEFAULT_EMOJI: EmojiProps = {
  id: 'writing_hand',
  name: 'Writing Hand',
  keywords: ['lower', 'left', 'ballpoint', 'pen', 'stationery', 'write', 'compose'],
  native: '✍️',
  shortcodes: ':writing_hand:',
  unified: '270d-fe0f',
} as const

export const $emailTemplate = map<EmailTemplateProps>({
  name: 'Untitled',
  description: undefined,
  content: [],
  emoji: DEFAULT_EMOJI,
  settings: DEFAULT_SETTINGS,
})
