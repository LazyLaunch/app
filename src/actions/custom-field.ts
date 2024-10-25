import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  bulkDeleteCustomField,
  createCustomField,
  hasCustomFieldsPermission,
  isUniqCustomFieldName,
} from '@/db/models/custom-field'
import { CUSTOM_FIELD_TYPE_LIST, ResponseStatusEnum, ResponseStatusMessageEnum } from '@/types'

const customFieldIdsSchema = z.array(z.string().uuid())

export const customField = {
  create: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().uuid(),
        teamId: z.string().uuid(),
        name: z.string({
          required_error: 'Name is required.',
          invalid_type_error: 'Invalid name format. Please enter a valid name.',
        }),
        type: z.enum(CUSTOM_FIELD_TYPE_LIST),
      })
      .refine(async ({ name, projectId }) => await isUniqCustomFieldName(name, projectId), {
        message: 'This field name is already in use. Please use a different name.',
        path: ['name'],
      }),
    handler: async ({ csrfToken, ...rest }, context) => {
      const user = context.locals.user!
      const data = await createCustomField({ ...rest, userId: user.id })
      return data
    },
  }),
  deleteBulk: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      ids: z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val)
          customFieldIdsSchema.parse(parsed)
          return parsed
        } catch (err) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Custom field ids is not valid JSON or does not match the expected structure.',
          })
          return z.NEVER
        }
      }),
    }),
    handler: async ({ ids }, context) => {
      const user = context.locals.user!
      const hasPermission = await hasCustomFieldsPermission({ ids, userId: user.id })
      if (!hasPermission) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }
      await bulkDeleteCustomField({ ids })
      return true
    },
  }),
}
