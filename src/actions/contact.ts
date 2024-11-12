import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  bulkCreateContactEmails,
  createContact,
  deleteContact,
  getContactFields,
  getContacts,
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
import { handleNumberInput, snakeToCamel } from '@/lib/utils'
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
    id: z.string().refine(
      (val) => {
        const contactFields = getContactFields()
        const contactField = contactFields.find(({ name }) => snakeToCamel(name) === val)

        return Boolean(contactField)
      },
      () => ({
        message: 'Column name is not valid.',
        path: ['id'],
      })
    ),
    desc: z.boolean(),
  })
)
const customFieldSortingSchema = z.array(
  z.object({
    id: z.string().cuid2(),
    desc: z.boolean(),
  })
)

const columnFiltersSchema = z.array(
  z.object({
    id: z.string().refine(
      (val) => {
        const contactFields = getContactFields()
        const contactField = contactFields.find(({ name }) => snakeToCamel(name) === val)

        return Boolean(contactField)
      },
      () => ({
        message: 'Column name is not valid.',
        path: ['id'],
      })
    ),
    value: z.union([
      z.array(z.boolean()),
      z.array(z.string()),
      z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
    ]),
  })
)

export const contact = {
  filters: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().cuid2(),
      teamId: z.string().cuid2(),
      pageIndex: z.optional(
        z.string().transform((val) => {
          return handleNumberInput(val, { min: DEFAULT_PAGE_INDEX })
        })
      ),
      pageSize: z.optional(
        z.string().transform((val) => {
          const pageSize = DEFAULT_PAGE_SIZES.includes(Number.parseInt(val))
            ? val
            : `${DEFAULT_PAGE_SIZE}`
          return handleNumberInput(pageSize, {
            min: DEFAULT_PAGE_SIZE,
            max: DEFAULT_MAX_PAGE_SIZE,
          })
        })
      ),
      customFieldsSorting: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: ContactCustomFieldSort[] = JSON.parse(val)
            customFieldSortingSchema.parse(parsed)
            return parsed
          } catch (err) {
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
            return z.NEVER
          }
        })
      ),
      sorting: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: ContactSortFields = JSON.parse(val)
            sortingSchema.parse(parsed)
            return parsed
          } catch (err) {
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
            return z.NEVER
          }
        })
      ),
      globalFilter: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: GlobalContactColumnFilter[] = JSON.parse(val)
            z.array(
              z.object({
                id: z.optional(z.string().cuid2()),
                field: z.string(),
                value: z.union([z.string(), z.number()]),
                isCustomField: z.boolean(),
              })
            ).parse(parsed)

            return parsed
          } catch (err) {
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
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
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
            return z.NEVER
          }
        })
      ),
      customColumnFilters: z.optional(
        z.string().transform((val, ctx) => {
          try {
            const parsed: ContactCustomColumnFilters = JSON.parse(val)
            columnFiltersSchema.parse(parsed)
            return parsed
          } catch (err) {
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
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
        sorting,
        pageSize = DEFAULT_PAGE_SIZE,
        pageIndex = DEFAULT_PAGE_INDEX,
        customFieldsSorting,
        globalFilter = [],
        customColumnFilters = [],
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
        customFieldsSorting,
        globalFilter,
        customColumnFilters,
      })

      return data
    },
  }),
  createBulk: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().cuid2(),
        teamId: z.string().cuid2(),
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
        projectId: z.string().cuid2(),
        teamId: z.string().cuid2(),
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
              z.string().cuid2(),
              z.union([z.string(), z.date(), z.boolean(), z.number()])
            ).parse(parsed)
            return parsed
          } catch (err) {
            for (const e of err.errors) {
              ctx.addIssue(e)
            }
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
        projectId: z.string().cuid2(),
        id: z.string().cuid2(),
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
                z.string().cuid2(),
                z.union([z.string(), z.date(), z.boolean(), z.number()])
              ).parse(parsed)
              return parsed
            } catch (err) {
              for (const e of err.errors) {
                ctx.addIssue(e)
              }
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
      id: z.string().cuid2(),
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
