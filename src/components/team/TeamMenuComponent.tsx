import { EllipsisVertical } from 'lucide-react'

import type { SelectTeam } from '@/db/schema'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  team: Partial<SelectTeam>
}

export function TeamMenuComponent({ team }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={`/${team.slug}`}>View</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href={`/${team.slug}/settings`}>Settings</a>
        </DropdownMenuItem>
        <DropdownMenuItem>Copy Invite URL</DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <a href="#">Leave Team</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
