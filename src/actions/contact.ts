import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  bulkCreateContactEmails,
  createContact,
  deleteContact,
  getContacts,
  getUniqueContactEmails,
  hasContactPermission,
  isUniqContactEmail,
  type ContactColumnFilters,
  type ContactSortFields,
} from '@/db/models/contact'
import { handleNumberInput } from '@/lib/utils'
import { validateEmails } from '@/lib/validate-emails'
import {
  DEFAULT_MAX_PAGE_SIZE,
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZES,
  ResponseStatusEnum,
  ResponseStatusMessageEnum,
} from '@/types'

const sortingSchema = z.array(
  z.object({
    id: z.string(),
    desc: z.boolean(),
  })
)

const columnFiltersSchema = z.array(
  z.object({
    id: z.string(),
    value: z.union([z.any(), z.array(z.any())]),
  })
)

export const contact = {
  filters: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().uuid(),
      teamId: z.string().uuid(),
      pageIndex: z.optional(
        z.string().transform((val) => {
          return handleNumberInput(val, { min: DEFAULT_PAGE_INDEX })
        })
      ),
      pageSize: z.optional(
        z.string().transform((val) => {
          const pageSize = DEFAULT_PAGE_SIZES.includes(Number.parseInt(val)) ? val : `${DEFAULT_PAGE_SIZE}`
          return handleNumberInput(pageSize, { min: DEFAULT_PAGE_SIZE, max: DEFAULT_MAX_PAGE_SIZE })
        })
      ),
      sorting: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: ContactSortFields = JSON.parse(val)
            sortingSchema.parse(parsed)
            return parsed
          } catch (err) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Contact sorting is not valid JSON or does not match the expected structure.',
            })
            return z.NEVER
          }
        })
      ),
      columnFilters: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: ContactColumnFilters = JSON.parse(val)
            columnFiltersSchema.parse(parsed)
            return parsed
          } catch (err) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Contact column filters is not valid JSON or does not match the expected structure.',
            })
            return z.NEVER
          }
        })
      ),
    }),
    handler: async (
      {
        teamId,
        projectId,
        columnFilters = [],
        sorting = [],
        pageSize = DEFAULT_PAGE_SIZE,
        pageIndex = DEFAULT_PAGE_INDEX,
      },
      context
    ) => {
      const data = await getContacts({
        teamId,
        projectId,
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortFields: sorting,
        columnFilters,
      })

      return data
    },
  }),
  createBulk: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().uuid(),
        teamId: z.string().uuid(),
        emails: z
          .string({
            required_error: 'Please enter at least one email address.',
            invalid_type_error:
              'Invalid emails format. Enter the email addresses, separated by commas.',
          })
          .max(50000, { message: 'Email addresses cannot exceed 50,000 characters.' })
          .superRefine((emails, ctx) => {
            const { isValid, invalidEmails } = validateEmails(emails)

            if (!isValid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `One or more email addresses are invalid. Please check and try again.\n ${invalidEmails.join(',')}`,
              })
            }
          }),
      })
      .transform(async (input) => {
        const { emails, teamId, projectId } = input
        const uniqEmails = await getUniqueContactEmails({
          emails: emails.split(',').map((val) => val.trim()),
          teamId,
          projectId,
        })

        return { ...input, emails: uniqEmails }
      }),
    handler: async ({ emails, projectId, teamId }, context) => {
      const user = context.locals.user!
      await bulkCreateContactEmails({ emails, projectId, teamId, userId: user.id })

      return true
    },
  }),
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
