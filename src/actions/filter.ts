import { defineAction } from 'astro:actions'
import { z, type ZodError } from 'astro:schema'

import {
  batchContactResponse,
  buildContactConditions,
  getContactFields,
  type ContactCustomFieldSort,
  type ContactSortFields,
} from '@/db/models/contact'
import {
  buildDynamicFilter,
  getFilterConditions,
  isUniqFilterName,
  saveFilters,
  type ExtendedFilterCondition,
  type FilterCondition,
} from '@/db/models/filter'

import { CUID_LENGTH, CUSTOM_FIELD_TYPE_LIST } from '@/constants'
import { ConditionTypeEnum, OperatorEnum } from '@/enums'
import {
  customFieldSortingSchema,
  paginationPageSchema,
  paginationPageSizeSchema,
  sortingSchema,
} from '@/validations/contacts-page'

const filterConditionsSchema = z
  .array(
    z
      .object({
        id: z.optional(z.string().length(CUID_LENGTH)),
        filterId: z.optional(z.string().length(CUID_LENGTH)),
        columnType: z
          .string()
          .max(50)
          .refine(
            (val) => {
              return CUSTOM_FIELD_TYPE_LIST.includes(val as any)
            },
            () => ({
              message: 'Column type is not valid.',
              path: ['columnType'],
            })
          ),
        columnName: z
          .string()
          .max(256)
          .refine(
            (val) => {
              const contactFields = getContactFields()
              const contactField = contactFields.find(({ name }) => name === val)

              return val.length === CUID_LENGTH || Boolean(contactField) || val === ''
            },
            () => ({
              message: 'Column name is not valid.',
              path: ['columnName'],
            })
          ),
        conditionType: z
          .number({
            required_error: 'Condition type is required.',
            invalid_type_error: 'Condition type must be a number.',
          })
          .refine(
            (val) => {
              const conditionTypes = Object.values(ConditionTypeEnum).filter(
                (value) => typeof value === 'number'
              )
              return conditionTypes.includes(val)
            },
            () => ({
              message: 'Condition type is not valid.',
              path: ['conditionType'],
            })
          ),
        operator: z
          .number({
            required_error: 'Operator is required.',
            invalid_type_error: 'Operator must be a number.',
          })
          .refine(
            (val) => {
              const operators = Object.values(OperatorEnum).filter(
                (value) => typeof value === 'number'
              )
              return operators.includes(val)
            },
            () => ({
              message: 'Condition type is not valid.',
              path: ['operator'],
            })
          ),
        secondaryValue: z.optional(z.union([z.string().max(256), z.number()])),
        value: z.optional(z.union([z.string().max(256), z.number()])),
      })
      .refine(
        ({ operator, value }) => {
          const allowEmpty = [
            OperatorEnum.IS_EMPTY,
            OperatorEnum.IS_NOT_EMPTY,
            OperatorEnum.IS_TRUE,
            OperatorEnum.IS_FALSE,
          ].includes(Number(operator))
          if (allowEmpty) return true
          return Boolean(value)
        },
        () => ({
          message: 'Value is empty.',
          path: ['value'],
        })
      )
      .refine(
        ({ operator, secondaryValue }) => {
          const isBetween = OperatorEnum.BETWEEN === Number(operator)
          if (!isBetween) return true
          return Boolean(secondaryValue)
        },
        () => ({
          message: 'Secondary value is empty.',
          path: ['secondaryValue'],
        })
      )
  )
  .min(0)
  .max(50)

export const filter = {
  save: defineAction({
    accept: 'form',
    input: z
      .object({
        csrfToken: z.string(),
        projectId: z.string().length(CUID_LENGTH),
        teamId: z.string().length(CUID_LENGTH),
        id: z.string().length(CUID_LENGTH).optional(),
        deleteFilterConditionIds: z
          .string()
          .optional()
          .transform((val, ctx) => {
            try {
              const parsed: string[] = val ? JSON.parse(val) : []
              z.array(z.string().length(CUID_LENGTH)).parse(parsed)
              return parsed
            } catch (err) {
              const { errors } = err as ZodError
              for (const e of errors) ctx.addIssue(e)
              return z.NEVER
            }
          }),
        name: z
          .string({
            required_error:
              'Segment name cannot be empty. Please provide a name to save the filter.',
          })
          .max(25, {
            message: 'Segment name cannot exceed 25 characters. Please use a shorter name.',
          }),
        filterConditions: z.optional(
          z.string().transform((val, ctx) => {
            try {
              const parsed: ExtendedFilterCondition[] = JSON.parse(val)
              filterConditionsSchema.parse(parsed)
              return parsed
            } catch (err) {
              const { errors } = err as ZodError
              for (const e of errors) ctx.addIssue(e)
              return z.NEVER
            }
          })
        ),
      })
      .superRefine(async ({ name, projectId, teamId, id }, ctx) => {
        if (id) return
        const isUniq = await isUniqFilterName({ name, projectId, teamId })

        if (!isUniq) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This name is already in use. Please use a different name.',
            path: ['name'],
          })
        }
      }),
    handler: async ({ csrfToken, id: filterId, filterConditions, ...input }, context) => {
      const user = context.locals.user!
      return await saveFilters({
        ...input,
        id: filterId,
        userId: user.id,
        filterConditions: filterConditions || [],
      })
    },
  }),
  contacts: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().length(CUID_LENGTH),
      teamId: z.string().length(CUID_LENGTH),
      pageIndex: paginationPageSchema({ z }),
      pageSize: paginationPageSizeSchema({ z }),
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
      filterConditions: z.string().transform((val, ctx) => {
        try {
          const parsed: FilterCondition[] = JSON.parse(val)
          filterConditionsSchema.parse(parsed)
          return parsed
        } catch (err) {
          const { errors } = err as ZodError
          for (const e of errors) ctx.addIssue(e)
          return z.NEVER
        }
      }),
    }),
    handler: async (
      { filterConditions, teamId, projectId, sorting, customFieldsSorting, pageSize, pageIndex },
      context
    ) => {
      const user = context.locals.user!
      const contactFields = getContactFields()
      const whereConditions = buildDynamicFilter({
        filterConditions,
        teamId,
        projectId,
        contactFields,
      })
      const { sortBy } = buildContactConditions({
        sortFields: sorting,
        customFieldsSorting: customFieldsSorting,
        columnFilters: [],
        customColumnFilters: [],
        globalFilter: [],
      })

      return await batchContactResponse({
        teamId,
        projectId,
        contactsLimit: pageSize,
        contactsOffset: pageIndex * pageSize,
        contactsSortBy: sortBy,
        conditions: [whereConditions],
        skipData: ['customFields', 'filters'],
      })
    },
  }),
  contactsByFilterId: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().length(CUID_LENGTH),
      teamId: z.string().length(CUID_LENGTH),
      filterId: z.optional(z.string().length(CUID_LENGTH)),
      pageIndex: paginationPageSchema({ z }),
      pageSize: paginationPageSizeSchema({ z }),
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
    }),
    handler: async (
      { filterId, teamId, projectId, sorting, customFieldsSorting, pageSize, pageIndex },
      context
    ) => {
      const _filterConditions = filterId ? await getFilterConditions({ filterId }) : []
      const contactFields = getContactFields()
      const filterWhereConditions = filterId
        ? [
            buildDynamicFilter({
              filterConditions: _filterConditions,
              contactFields,
              teamId,
              projectId,
            }),
          ]
        : []
      const { sortBy, whereConditions } = buildContactConditions({
        sortFields: sorting,
        customFieldsSorting: customFieldsSorting,
        columnFilters: [],
        customColumnFilters: [],
        globalFilter: [],
      })

      return await batchContactResponse({
        teamId,
        projectId,
        filterId,
        contactsLimit: pageSize,
        contactsOffset: pageIndex * pageSize,
        contactsSortBy: sortBy,
        conditions: filterId ? filterWhereConditions : whereConditions,
        skipData: ['customFields'],
      })
    },
  }),
}
