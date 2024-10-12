import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { actions } from 'astro:actions'
import { LogOut, Settings } from 'lucide-react'

import { AvatarComponent } from '@/components/avatar-component'

import type { UserProps } from '@/components/avatar-component'

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
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="font-medium text-neutral-900">{user.name}</p>
          <p className="font-light text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem className="font-light leading-7 text-muted-foreground hover:text-muted">
          <a href="/account" className="flex w-full justify-between">
            Settings
            <Settings className="h-4 w-4 self-center" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-light leading-7 text-muted-foreground hover:text-muted">
          <form method="POST" action={'/login' + actions.user.logout} className="w-full">
            <input type="hidden" name={CSRF_TOKEN} value={csrfToken} />
            <button type="submit" className="flex w-full justify-between">
              Logout
              <LogOut className="h-4 w-4 self-center" />
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
