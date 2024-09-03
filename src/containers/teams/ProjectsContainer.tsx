import { Search } from 'lucide-react'
import { useState } from 'react'

import type { ProjectFormResponseData } from '@/components/project/NewProjectForm'
import type { SelectTeam } from '@/db/schema'

import { AddBtnProjectComponent } from '@/components/project/AddBtnProjectComponent'
import { ProjectMenuComponent } from '@/components/project/ProjectMenuComponent'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Props {
  initProjects: ProjectFormResponseData[]
  csrfToken: string
  team: SelectTeam
}

export function ProjectsContainer({ initProjects, csrfToken, team }: Props) {
  const [projects, setProjects] = useState<ProjectFormResponseData[]>(initProjects)

  function addProject({ name, slug, teamId }: ProjectFormResponseData) {
    setProjects((prevState) => [...prevState, { name, slug, teamId }])
  }

  const deleteProject = (projectSlug: string) => {
    setProjects((prevState) => prevState.filter(({ slug }) => slug !== projectSlug))
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Teams Overview</h2>
        <p className="text-muted-foreground">The teams that are associated with your account.</p>
      </div>
      <div className="flex space-x-3">
        <form className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for a team..." className="w-full pl-8" />
          </div>
        </form>
        <AddBtnProjectComponent csrfToken={csrfToken} teamId={team.id} addProject={addProject} />
      </div>
      {projects.map((project) => (
        <Card key={project.slug}>
          <CardContent className="flex justify-between p-3.5">
            <div>
              <CardTitle className="text-sm">
                <a
                  href={`/${team.slug}/${project.slug}`}
                  className="cursor-pointer outline-0 hover:underline"
                >
                  {project.name}
                </a>
              </CardTitle>
              <CardDescription className="text-sm font-normal text-muted-foreground">
                Owner
              </CardDescription>
            </div>
            <ProjectMenuComponent
              deleteProject={deleteProject}
              team={team}
              project={project}
              csrfToken={csrfToken}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
