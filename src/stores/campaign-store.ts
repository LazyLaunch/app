import { map } from 'nanostores'

export interface CampaignDetails {
  name: string
  subject: string
  from: string
  preheader: string
  recipients: string[]
}

export const DEFAULT_CAMPAIGN_DETAILS: CampaignDetails = {
  name: '',
  subject: '',
  from: '',
  preheader: '',
  recipients: [],
} as const

export const $campaign = map<CampaignDetails>()
