import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { createEmail, deleteEmail, existsEmail, setPrimaryEmail } from '@/db/models/email'

export const email = {
  create: defineAction({
    accept: 'form',
    input: z.object({
      name: z
        .string({
          required_error: 'Email address is required.',
          invalid_type_error: 'Email address must be a string.',
        })
        .email({ message: 'Invalid email address.' })
        .refine(
          async (email) => !(await existsEmail(email)),
          () => ({ message: 'Email is already defined.' })
        ),
    }),
    handler: async ({ name }, context) => {
      const user = context.locals.user!
      await createEmail({ name, userId: user.id })

      return { email: name }
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      email: z
        .string({
          required_error: 'Email is required',
          invalid_type_error: 'Email must be a string',
        })
        .email({ message: 'Invalid email address' }),
    }),
    handler: async ({ email }, context) => {
      const user = context.locals.user!
      const isPrimary = email === user.email

      if (email && !isPrimary) {
        await deleteEmail(email, user.id)
      }
    },
  }),
  setAsPrimary: defineAction({
    accept: 'form',
    input: z.object({
      isVerified: z.boolean({ message: 'Verified is required.' }),
      email: z
        .string({
          required_error: 'Email is required.',
          invalid_type_error: 'Email must be a string.',
        })
        .email({ message: 'Invalid email address.' }),
    }),
    handler: async ({ email, isVerified }, context) => {
      const user = context.locals.user!
      const isPrimary = email === user.email
      if (isVerified && !isPrimary) await setPrimaryEmail(email, user.id)
    },
  }),
}
