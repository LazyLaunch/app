import { useStore } from '@nanostores/react'
import { Mail } from 'lucide-react'

import { Card } from '@/components/ui/card'

import { $campaign } from '@/stores/campaign-store'

function SkeletonSection() {
  return (
    <div className="space-y-4 bg-gray-50 bg-opacity-50 py-6 pl-6 dark:bg-gray-600">
      <div className="h-[0.55rem] w-1/5 rounded bg-gray-300 dark:bg-gray-400" />
      <div className="h-[0.5rem] w-2/3 rounded bg-gray-200 bg-opacity-75 dark:bg-gray-500" />
    </div>
  )
}

export function CampaignsInboxPreview({ className }: { className: string }) {
  const _campaign = useStore($campaign)

  return (
    <Card className={className}>
      <div className="flex items-center space-x-2 border-b px-6 py-3">
        <Mail className="size-4" />
        <span>Inbox Preview</span>
      </div>
      <SkeletonSection />
      <div className="-ml-3 items-start rounded-l border-b border-l-[0.3rem] border-t border-l-green-500 bg-white px-6 py-5 shadow-md dark:border-b-gray-500 dark:border-t-gray-500 dark:bg-gray-700">
        <div className="items-start space-y-1">
          <h5 className="font-semibold leading-tight">
            {_campaign.from || 'Your sender name will appear here.'}
          </h5>
          <p className="pt-[0.13rem] text-xs text-black text-opacity-75 dark:text-white dark:text-opacity-75">
            {_campaign.subject || 'Your email subject will appear here.'}
          </p>
          <p className="text-xs text-black text-opacity-50 dark:text-white dark:text-opacity-50">
            {_campaign.preheader || 'Your email preheader will appear here.'}
          </p>
        </div>
      </div>
      <SkeletonSection />
    </Card>
  )
}
