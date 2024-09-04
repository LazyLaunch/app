import { Search } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import type { FormResponseData } from '@/components/team/AddTeamBtnComponents'
import type { Team } from '@/db/models/team'

import { AddTeamBtnComponent } from '@/components/team/AddTeamBtnComponents'
import { TeamMenuComponent } from '@/components/team/TeamMenuComponent'
import { UserRolesEnum } from '@/lib/rbac'
import { capitalizeFirstLetter } from '@/lib/utils'

interface Props {
  initTeams: Partial<Team>[]
  csrfToken: string
}

export function TeamsContainer({ initTeams, csrfToken }: Props) {
  const [teams, setTeams] = useState(initTeams)

  function addTeam({ name, slug, userId }: FormResponseData) {
    setTeams((prevTeams) => [...prevTeams, { name, slug, userId, role: UserRolesEnum.OWNER }])
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Teams Overview</h2>
        <p className="text-muted-foreground">The teams that are associated with your account.</p>
      </div>
      <div className="flex">
        <form className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for a team..." className="w-full pl-8" />
          </div>
        </form>
        <AddTeamBtnComponent className="ml-2.5" csrfToken={csrfToken} addTeam={addTeam} />
      </div>
      {teams.map((team) => (
        <Card key={team.slug}>
          <CardContent className="flex justify-between p-3.5">
            <div>
              <CardTitle className="text-sm">
                <a href={`/${team.slug}`} className="cursor-pointer outline-0 hover:underline">
                  {team.name}
                </a>
              </CardTitle>
              <CardDescription className="text-sm font-normal text-muted-foreground">
                {capitalizeFirstLetter(team.role)}
              </CardDescription>
            </div>
            <TeamMenuComponent team={team} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
