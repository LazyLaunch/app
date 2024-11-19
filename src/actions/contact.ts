import { ActionError, defineAction } from 'astro:actions'
import { z, type ZodError } from 'astro:schema'

import { CUID_LENGTH } from '@/constants'
import {
  batchContactResponse,
  buildContactConditions,
  bulkCreateContactEmails,
  createContact,
  deleteContact,
  getContactFields,
  getUniqueContactEmails,
  hasContactPermission,
  isUniqContactEmail,
  updateContact,
  type ContactColumnFilters,
  type ContactCustomColumnFilters,
  type ContactCustomFieldSort,
  type ContactSortFields,
  type GlobalContactColumnFilter,
} from '@/db/models/contact'
import { ResponseStatusEnum, ResponseStatusMessageEnum } from '@/enums'
import { validateEmails } from '@/lib/validate-emails'
import {
  columnFiltersSchema,
  customFieldSortingSchema,
  globalFilterSchema,
  paginationPageSchema,
  paginationPageSizeSchema,
  sortingSchema,
} from '@/validations/contacts-page'

export const contact = {
  filters: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().length(CUID_LENGTH),
      teamId: z.string().length(CUID_LENGTH),
      pageIndex: paginationPageSchema({ z }),
      pageSize: paginationPageSizeSchema({ z }),
      customFieldsSorting: z.string().transform((val, ctx) => {
        try {
          const parsed: ContactCustomFieldSort[] = JSON.parse(val)
          customFieldSortingSchema(z).parse(parsed)
          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
      sorting: z.string().transform((val, ctx) => {
        try {
          const parsed: ContactSortFields = JSON.parse(val)
          sortingSchema({ z, contactFields: getContactFields() }).parse(parsed)
          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
      globalFilter: z.string().transform((val, ctx) => {
        try {
          const parsed: GlobalContactColumnFilter[] = JSON.parse(val)
          globalFilterSchema({ z }).parse(parsed)

          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
      columnFilters: z.string().transform((val, ctx) => {
        try {
          const parsed: ContactColumnFilters = JSON.parse(val)
          columnFiltersSchema({ z, contactFields: getContactFields() }).parse(parsed)
          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
      customColumnFilters: z.string().transform((val, ctx) => {
        try {
          const parsed: ContactCustomColumnFilters = JSON.parse(val)
          columnFiltersSchema({ z, contactFields: getContactFields() }).parse(parsed)
          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
    }),
    handler: async (
      {
        teamId,
        projectId,
        columnFilters = [],
        sorting,
        pageSize,
        pageIndex,
        customFieldsSorting,
        globalFilter,
        customColumnFilters,
      },
      context
    ) => {
      const { sortBy, whereConditions } = buildContactConditions({
        sortFields: sorting,
        columnFilters,
        customFieldsSorting,
        globalFilter,
        customColumnFilters,
      })

      return await batchContactResponse({
        teamId,
        projectId,
        contactsLimit: pageSize,
        contactsOffset: pageIndex * pageSize,
        contactsSortBy: sortBy,
        conditions: whereConditions,
        skipData: ['customFields'],
      })
    },
  }),
  createBulk: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().length(CUID_LENGTH),
        teamId: z.string().length(CUID_LENGTH),
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
        projectId: z.string().length(CUID_LENGTH),
        teamId: z.string().length(CUID_LENGTH),
        email: z
          .string({
            required_error: 'Email is required. Please enter your email address.',
            invalid_type_error: 'Invalid email format. Please enter a valid email address.',
          })
          .max(256, { message: 'Email address is too long. It must be 256 characters or less.' })
          .email({ message: 'Please enter a valid email address.' }),
        firstName: z.string().max(256).optional(),
        lastName: z.string().max(256).optional(),
        customFields: z.string().transform((val, ctx) => {
          try {
            const parsed: Record<string, string | boolean | number> = JSON.parse(val)
            z.record(
              z.string().length(CUID_LENGTH),
              z.union([z.string(), z.date(), z.boolean(), z.number()])
            ).parse(parsed)
            return parsed
          } catch (err) {
            const { errors } = err as ZodError
            for (const e of errors) ctx.addIssue(e)
            return z.NEVER
          }
        }),
      })
      .refine(
        async ({ email, projectId }) => await isUniqContactEmail(email, projectId),
        () => ({
          message: 'This email address is already in use. Please use a different email.',
          path: ['email'],
        })
      ),
    handler: async ({ customFields, ...input }, context) => {
      const user = context.locals.user!

      await createContact({ ...input, userId: user.id }, customFields)
      return true
    },
  }),
  update: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().length(CUID_LENGTH),
        id: z.string().length(CUID_LENGTH),
        email: z.optional(
          z
            .string({
              required_error: 'Email is required. Please enter your email address.',
              invalid_type_error: 'Invalid email format. Please enter a valid email address.',
            })
            .max(256, { message: 'Email address is too long. It must be 256 characters or less.' })
            .email({ message: 'Please enter a valid email address.' })
        ),
        firstName: z.string().max(256).optional(),
        lastName: z.string().max(256).optional(),
        customFields: z.optional(
          z.string().transform((val, ctx) => {
            try {
              const parsed: Record<string, string | boolean | number> = JSON.parse(val)
              z.record(
                z.string().length(CUID_LENGTH),
                z.union([z.string(), z.date(), z.boolean(), z.number()])
              ).parse(parsed)
              return parsed
            } catch (err) {
              const { errors } = err as ZodError
              for (const e of errors) ctx.addIssue(e)
              return z.NEVER
            }
          })
        ),
      })
      .refine(
        async ({ email, projectId }) => {
          if (!email) return true
          return await isUniqContactEmail(email, projectId)
        },
        () => ({
          message: 'This email address is already in use. Please use a different email.',
          path: ['email'],
        })
      ),
    handler: async ({ csrfToken, customFields, ...input }, context) => {
      const user = context.locals.user!
      const hasPermission = await hasContactPermission({ id: input.id, userId: user.id })
      if (!hasPermission) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }

      const formData = context.locals.formDataParsed!

      const data: typeof input = {} as typeof input
      for (const fieldName of Object.keys(input)) {
        if (formData.has(fieldName)) {
          const val = formData.get(fieldName)
          data[fieldName as keyof typeof input] = val as string
        }
      }

      await updateContact({ ...data, customFields })

      return true
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      id: z.string().length(CUID_LENGTH),
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
