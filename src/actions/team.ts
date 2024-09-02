import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  createTeam,
  deleteTeam,
  getTeamBySlugAndUser,
  initTeamWithProject,
  updateTeam,
} from '@/db/models/team'
import type { InsertTeam } from '@/db/schema'

interface TeamProps extends Omit<InsertTeam, 'name' | 'address'> {
  name: string
  address: string
}

export const team = {
  create: defineAction({
    accept: 'form',
    input: z.object({
      teamName: z.string({
        required_error: 'Please enter a team name.',
        invalid_type_error: 'Team name must be a string.',
      }),
      address: z.string({
        required_error: 'Please enter an address.',
        invalid_type_error: 'Address must be a string.',
      }),
    }),
    handler: async ({ teamName, address }, context) => {
      const user = context.locals.user!
      const team = await createTeam({ name: teamName, userId: user.id, address })
      return { name: team.name, slug: team.slug, userId: user.id }
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      slug: z.string({
        required_error: 'Please enter a team slug.',
        invalid_type_error: 'Team slug must be a string.',
      }),
    }),
    handler: async ({ slug }, context) => {
      const user = context.locals.user!
      await deleteTeam(slug, user.id)
    },
  }),
  update: defineAction({
    accept: 'form',
    input: z.object({
      name: z
        .string({
          required_error: 'Please enter a display name.',
          invalid_type_error: 'Display name must be a string.',
        })
        .optional(),
      address: z.optional(
        z.string({
          required_error: 'Address is required.',
          invalid_type_error: 'Address must be a string.',
        })
      ),
      slug: z.string({
        required_error: 'Slug is required.',
        invalid_type_error: 'Slug must be a string.',
      }),
    }),
    handler: async (input, context) => {
      const { slug } = input
      const user = context.locals.user!
      const team = await getTeamBySlugAndUser({
        slug: slug!,
        userId: user.id,
        fields: ['name', 'address'],
      })

      const data: Partial<TeamProps> = {
        name: team!.name,
        address: team!.address,
      }
      let isDirty: boolean = false

      for (const key of Object.keys(input)) {
        const val = input[key as keyof typeof input]
        if (typeof val === 'undefined') continue

        data[key as keyof TeamProps] = val as string
        isDirty = true
      }

      if (isDirty) {
        await updateTeam({ slug, userId: user.id, data: data as TeamProps })
      }
    },
  }),
  init: defineAction({
    accept: 'form',
    input: z.object({
      companyName: z.string({
        required_error: 'Please enter an company name.',
        invalid_type_error: 'Company name must be a string.',
      }),
      projectName: z.string({
        required_error: 'Please enter an project name.',
        invalid_type_error: 'Project name must be a string.',
      }),
      address: z.string({
        required_error: 'Address is required.',
        invalid_type_error: 'Address must be a string.',
      }),
    }),
    handler: async ({ companyName, projectName, address }, context) => {
      const user = context.locals.user!

      await initTeamWithProject({
        teamName: companyName,
        projectName,
        address,
        userId: user.id,
      })
    },
  }),
}
