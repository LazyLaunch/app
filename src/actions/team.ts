import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  createTeam,
  deleteTeam,
  getTeamBySlugAndUser,
  initTeamWithProject,
  updateTeam,
} from '@/db/models/team'

interface TeamProps {
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
      csrfToken: z.string(),
    }),
    handler: async ({ teamName, address }, context) => {
      const user = context.locals.user!
      teamName = teamName.trim()
      address = address.trim()

      const team = await createTeam({ name: teamName, ownerId: user.id, address })
      return { name: team.name, slug: team.slug, ownerId: team.ownerId }
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      slug: z.string({
        required_error: 'Please enter a team slug.',
        invalid_type_error: 'Team slug must be a string.',
      }),
      csrfToken: z.string(),
    }),
    handler: async ({ slug }, context) => {
      const user = context.locals.user!
      const team = await getTeamBySlugAndUser({
        slug: slug!,
        userId: user.id,
      })
      if (team) await deleteTeam(team)
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
      csrfToken: z.string(),
    }),
    handler: async (input, context) => {
      const { slug } = input
      const user = context.locals.user!
      const team = await getTeamBySlugAndUser({
        slug: slug!,
        userId: user.id,
      })

      const data: TeamProps = {
        name: team!.name,
        address: team!.address,
      }
      let isDirty = false

      for (const key of Object.keys(input)) {
        const val = input[key as keyof typeof input]
        if (typeof val === 'undefined') continue

        data[key as keyof TeamProps] = val.trim() as string
        isDirty = true
      }

      if (isDirty && team) {
        await updateTeam({ data, team })
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
      csrfToken: z.string(),
    }),
    handler: async ({ companyName, projectName, address }, context) => {
      const user = context.locals.user!
      companyName = companyName.trim()
      projectName = projectName.trim()
      address = address.trim()

      await initTeamWithProject({
        teamName: companyName,
        projectName,
        address,
        userId: user.id,
      })
    },
  }),
}
