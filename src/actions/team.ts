import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { initTeamWithProject } from '@/db/models/team'

export const team = {
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
