import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { createProject, deleteProject, existsSlug } from '@/db/models/project'

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
    handler: async (input, context) => {
      const user = context.locals.user!
      const project = await createProject({
        name: input.slug,
        slug: input.slug,
        teamId: input.teamId,
        userId: user.id,
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
    handler: async (input, context) => {
      const user = context.locals.user
      await deleteProject(input.slug, input.teamId)
    },
  }),
}
