import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { CUID_LENGTH } from '@/constants'
import { bulkDeleteGroups, isUniqGroupName, saveGroup } from '@/db/models/group'

export const group = {
  save: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().length(CUID_LENGTH),
        teamId: z.string().length(CUID_LENGTH),
        id: z.optional(z.string().length(CUID_LENGTH)),
        name: z
          .string({
            required_error: 'Group name cannot be empty. Please provide a name to save the group.',
          })
          .max(25, {
            message: 'Group name cannot exceed 25 characters. Please use a shorter name.',
          }),
      })
      .superRefine(async ({ name, projectId, teamId, id }, ctx) => {
        if (id) return
        const isUniq = await isUniqGroupName({ name, projectId, teamId })

        if (!isUniq) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This name is already in use. Please use a different name.',
            path: ['name'],
          })
        }
      }),
    handler: async ({ csrfToken, ...input }, context) => {
      const user = context.locals.user!
      return await saveGroup({ ...input, userId: user.id })
    },
  }),
  deleteBulk: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().length(CUID_LENGTH),
      teamId: z.string().length(CUID_LENGTH),
      ids: z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val)
          z.array(z.string().length(CUID_LENGTH)).parse(parsed)
          return parsed
        } catch (err) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Group ids is not valid JSON or does not match the expected structure.',
          })
          return z.NEVER
        }
      }),
    }),
    handler: async ({ ids, teamId, projectId }, context) => {
      await bulkDeleteGroups({ ids, teamId, projectId })
      return true
    },
  }),
}
