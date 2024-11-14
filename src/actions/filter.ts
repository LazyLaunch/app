import { isCuid } from '@paralleldrive/cuid2'
import { defineAction } from 'astro:actions'
import { z, type ZodError } from 'astro:schema'

import { getContactFields, testContacts } from '@/db/models/contact'
import {
  buildDynamicFilter,
  ConditionType,
  Operator,
  saveFilters,
  type FilterCondition,
} from '@/db/models/filter'
import { CUSTOM_FIELD_TYPE_LIST } from '@/types'

const filterConditionsSchema = z
  .array(
    z
      .object({
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

              return isCuid(val) || Boolean(contactField) || val === ''
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
              const conditionTypes = Object.values(ConditionType).filter(
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
              const operators = Object.values(Operator).filter((value) => typeof value === 'number')
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
            Operator.IS_EMPTY,
            Operator.IS_NOT_EMPTY,
            Operator.IS_TRUE,
            Operator.IS_FALSE,
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
          const isBetween = Operator.BETWEEN === Number(operator)
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
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().cuid2(),
      teamId: z.string().cuid2(),
      filterId: z.string().cuid2().optional(),
      filterName: z
        .string({
          required_error: 'Segment name cannot be empty. Please provide a name to save the filter.',
        })
        .max(25, {
          message: 'Segment name cannot exceed 25 characters. Please use a shorter name.',
        })
        .superRefine((name, ctx) => {
          // const { isValid, invalidEmails } = validateEmails(emails)

          // if (!isValid) {
          //   ctx.addIssue({
          //     code: z.ZodIssueCode.custom,
          //     message: `One or more email addresses are invalid. Please check and try again.\n ${invalidEmails.join(',')}`,
          //   })
          // }
          return true
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
    handler: async ({ csrfToken, ...input }, context) => {
      const user = context.locals.user!
      await saveFilters({ ...input, userId: user.id })
      return input
    },
  }),
  contacts: defineAction({
    accept: 'form',
    input: z.object({
      csrfToken: z.string(),
      projectId: z.string().cuid2(),
      teamId: z.string().cuid2(),
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
    handler: async ({ filterConditions, teamId, projectId }, context) => {
      const user = context.locals.user!
      const contactFields = getContactFields()
      const conditions = buildDynamicFilter({ filterConditions, teamId, projectId, contactFields })
      const result = await testContacts({ conditions, teamId, projectId })
      return result
    },
  }),
}
