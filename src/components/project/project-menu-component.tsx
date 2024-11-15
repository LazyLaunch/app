import { actions, isInputError } from 'astro:actions'
import { EllipsisVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { CSRF_TOKEN, TOAST_ERROR_TIME, TOAST_SUCCESS_TIME } from '@/constants'

import type { SelectProject } from '@/db/schema'

import { PermissionGuardComponent } from '@/components/permission-guard-component'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserPermissionsEnum } from '@/lib/rbac'
import type { TeamSession } from '@/middleware/check-team-session'

interface Props {
  project: Partial<SelectProject>
  team: TeamSession
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

  async function onDeleteSubmit(values: FormValues) {
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
        duration: TOAST_ERROR_TIME,
        description: "Your project hasn't been created.",
      })
    } else if (error?.code || error?.message) {
      return toast.error(error.code, {
        duration: TOAST_ERROR_TIME,
        description: error.message,
      })
    }

    deleteProject(values.slug)
    toast.info('Project', {
      duration: TOAST_SUCCESS_TIME,
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
        <PermissionGuardComponent role={team.role} permission={UserPermissionsEnum.READ}>
          <DropdownMenuItem asChild className="cursor-pointer">
            <a href={`/${team.slug}/${project.slug}`}>View</a>
          </DropdownMenuItem>
        </PermissionGuardComponent>
        <DropdownMenuItem>
          <a href={`/${team.slug}/${project.slug}/settings`}>Settings</a>
        </DropdownMenuItem>
        <PermissionGuardComponent role={team.role} permission={UserPermissionsEnum.DELETE}>
          <DropdownMenuItem
            asChild
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <form onSubmit={form.handleSubmit(onDeleteSubmit)}>
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
        </PermissionGuardComponent>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
