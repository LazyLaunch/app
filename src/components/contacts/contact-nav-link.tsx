import { Database, Folders, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ContactNavLinkId } from '@/types'

const ICONS: Record<ContactNavLinkId, any> = {
  contacts: Users,
  fields: Database,
  segments: Folders,
} as const

export function ContactNavLink({
  label,
  id,
  active,
  url,
}: {
  label: string
  id: ContactNavLinkId
  active: ContactNavLinkId
  url: string
}) {
  const Comp = ICONS[id]
  const isActive = id === active
  return (
    <Button
      asChild
      variant="link"
      className={cn('space-x-2 rounded-none border-b-2 border-transparent hover:no-underline', {
        'border-accent-foreground': isActive,
        'hover:border-accent-foreground/10': !isActive,
      })}
    >
      <a href={url}>
        <Comp className="size-4" />
        <span>{label}</span>
      </a>
    </Button>
  )
}
