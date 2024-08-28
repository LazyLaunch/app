import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { AvatarComponent } from '@/components/AvatarComponent'

import type { UserProps } from '@/components/AvatarComponent'

import { CSRF_TOKEN } from '@/types'

interface Props {
  csrfToken: string
  user: UserProps
}

export function UserMenuComponent({ user, csrfToken }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <AvatarComponent user={user} className="h-full w-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-medium text-neutral-900">{user.name}</p>
          <p className="font-light text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form method="POST" action="/api/user/logout">
            <input type="hidden" name={CSRF_TOKEN} value={csrfToken} />
            <input type="submit" value="Logout" />
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
