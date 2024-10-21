import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  createContact,
  deleteContact,
  hasContactPermission,
  isUniqContactEmail,
} from '@/db/models/contact'
import { ResponseStatusEnum, ResponseStatusMessageEnum } from '@/types'

export const contact = {
  create: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().uuid(),
        teamId: z.string().uuid(),
        email: z
          .string({
            required_error: 'Email is required. Please enter your email address.',
            invalid_type_error: 'Invalid email format. Please enter a valid email address.',
          })
          .max(256, { message: 'Email address is too long. It must be 256 characters or less.' })
          .email({ message: 'Please enter a valid email address.' }),
        firstName: z.string().max(256).optional(),
        lastName: z.string().max(256).optional(),
      })
      .refine(
        async ({ email, projectId }) => await isUniqContactEmail(email, projectId),
        () => ({
          message: 'This email address is already in use. Please use a different email.',
          path: ['email'],
        })
      ),
    handler: async (input, context) => {
      const user = context.locals.user!

      await createContact({ ...input, userId: user.id })
      return true
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      id: z.string().uuid(),
    }),
    handler: async ({ id }, context) => {
      const user = context.locals.user!
      const hasPermission = await hasContactPermission({ id, userId: user.id })
      if (!hasPermission) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }

      await deleteContact({ id })
      return true
    },
  }),
}
