import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { avaInitials } from '@/lib/ava-initials'

import type { SelectUser } from '@/db/schema'

export type UserProps = Omit<SelectUser, 'picture'> & {
  picture: string | undefined
}

interface Props {
  user: UserProps
  className: string
}

export function AvatarComponent({ user, className }: Props) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={user.picture} alt={user.name} />
      <AvatarFallback className="bg-card">{avaInitials(user.name)}</AvatarFallback>
    </Avatar>
  )
}
