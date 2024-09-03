import { actions, isInputError } from 'astro:actions'
import { EllipsisVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { CSRF_TOKEN } from '@/types'

import type { SelectProject, SelectTeam } from '@/db/schema'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  project: Partial<SelectProject>
  team: SelectTeam
  csrfToken: string
  deleteProject: (slug: string) => void
}

interface FormValues {
  csrfToken: string
  slug: string
  teamId: string
}

export function ProjectMenuComponent({ project, team, csrfToken, deleteProject }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      slug: project.slug,
      teamId: team.id,
    },
  })

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    const { error } = await actions.project.delete(formData)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof typeof values, { message })
      }

      return toast.error('Project', {
        duration: 5000,
        description: "Your project hasn't been created.",
      })
    }

    deleteProject(values.slug)
    toast.info('Project', {
      duration: 5000,
      description: 'Your project has been deleted.',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={`/${team.slug}/${project.slug}`}>View</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href={`/${team.slug}/${project.slug}/settings`}>Settings</a>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <input
              {...form.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={csrfToken}
            />
            <input
              {...form.register('slug', { required: true })}
              type="hidden"
              name="slug"
              value={project.slug}
            />
            <input
              {...form.register('teamId', { required: true })}
              type="hidden"
              name="teamId"
              value={team.id}
            />
            <button type="submit">Delete Project</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
