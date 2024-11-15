import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { setPrimaryEmail } from '@/db/models/email'
import { existsUsername, updateUser } from '@/db/models/user'
import type { InsertUser } from '@/db/schema'
import { ResponseStatusEnum, ResponseStatusMessageEnum } from '@/enums'
import { lucia } from '@/lib/auth'

interface UserProps extends Omit<InsertUser, 'name' | 'email' | 'username'> {
  name: string
  username: string
  email: string
}

export const user = {
  update: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      name: z
        .string({
          required_error: 'Please enter a display name.',
          invalid_type_error: 'Display name must be a string.',
        })
        .optional(),
      email: z.optional(
        z
          .string({
            required_error: 'Email address is required.',
            invalid_type_error: 'Email address must be a string.',
          })
          .email({ message: 'Invalid email address.' })
      ),
      username: z.optional(
        z
          .string({
            required_error: 'Please enter a username.',
            invalid_type_error: 'Username must be a string.',
          })
          .refine(
            async (username) => username && !(await existsUsername(username)),
            () => ({ message: 'Username is already defined.' })
          )
      ),
    }),
    handler: async (input, context) => {
      const user = context.locals.user!

      const data: Partial<UserProps> = {
        name: user.name,
        username: user.username,
        email: user.email,
      }
      let isDirty = false

      for (const key of Object.keys(input)) {
        const val = input[key as keyof typeof input]
        if (typeof val === 'undefined') continue

        data[key as keyof UserProps] = val.trim() as string
        isDirty = true
      }

      if (isDirty) {
        if (input.email) return setPrimaryEmail(input.email, user.id)
        await updateUser(user.id, data as UserProps)
      }
    },
  }),
  logout: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
    }),
    handler: async (_, context) => {
      if (!context.locals.session) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }

      await lucia.invalidateSession(context.locals.session.id)

      const sessionCookie = lucia.createBlankSessionCookie()
      context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    },
  }),
}
