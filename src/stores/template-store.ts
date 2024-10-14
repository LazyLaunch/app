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

export const DEFAULT_EMAIL_TEMPLATE_NAME: string = 'Untitled' as const

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

const plateNodeId = Math.random().toString(36).slice(2, 7)
export const DEFAULT_EMAIL_TEMPLATE_CONTENT: ContentProps[] = [
  {
    id: plateNodeId,
    type: 'p',
    children: [{ text: '' }],
  },
]

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateProps = {
  name: DEFAULT_EMAIL_TEMPLATE_NAME,
  description: undefined,
  content: DEFAULT_EMAIL_TEMPLATE_CONTENT,
  emoji: DEFAULT_EMOJI,
  settings: DEFAULT_SETTINGS,
}

export const $emailTemplate = map<Partial<EmailTemplateProps>>()
