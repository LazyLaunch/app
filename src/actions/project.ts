import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { createProject, deleteProject, existsSlug } from '@/db/models/project'
import { UserPermissionsEnum } from '@/lib/rbac'
import { checkPermission } from '@/middleware/check-permission'
import { ResponseStatusEnum, ResponseStatusMessageEnum } from '@/types'

export const project = {
  create: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string({
        required_error: 'Please enter a project name.',
        invalid_type_error: 'Project name must be a string.',
      }),
      slug: z
        .string({
          required_error: 'Please enter a project slug.',
          invalid_type_error: 'Project slug must be a string.',
        })
        .refine(
          async (slug) => !(await existsSlug(slug)),
          () => ({ message: 'Slug is already defined.' })
        ),
      teamId: z.string(),
      csrfToken: z.string(),
    }),
    handler: async ({ name, slug, teamId }, context) => {
      const canAccess = await checkPermission(UserPermissionsEnum.CREATE, context, { teamId })
      if (!canAccess) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }

      name = name.trim()
      slug = slug.trim()
      const project = await createProject({
        name,
        slug,
        teamId,
      })

      return { name: project.name, slug: project.slug, teamId: project.teamId }
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      slug: z.string(),
      teamId: z.string(),
      csrfToken: z.string(),
    }),
    handler: async ({ slug, teamId }, context) => {
      const canAccess = await checkPermission(UserPermissionsEnum.DELETE, context, { teamId })
      if (!canAccess) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }
      await deleteProject(slug, teamId)
    },
  }),
}
