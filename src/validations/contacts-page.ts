import { handleNumberInput, snakeToCamel } from '@/lib/utils'

import { ContactTabFilterEnum } from '@/enums'

import {
  CONTACT_DEFAULT_SEARCH_FIELD,
  CONTACT_GLOBAL_SEARCH_FIELDS,
  CUID_LENGTH,
  DEFAULT_MAX_PAGE_SIZE,
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZES,
} from '@/constants'

import type { ContactFields } from '@/db/models/contact'
import type { ZNamespace } from '@/types'

export function contactTabSchema({ z }: { z: ZNamespace }) {
  return z.nativeEnum(ContactTabFilterEnum)
}

export function viewItemSchema({
  z,
  contactFields,
}: { z: ZNamespace; contactFields: ContactFields[] }) {
  return z.record(
    z.union([
      z.string().refine(
        (val: string) => {
          const contactField = contactFields.find(({ name }) => snakeToCamel(name) === val)

          return Boolean(contactField)
        },
        () => ({
          message: 'Column name is not valid.',
          path: ['id'],
        })
      ),
      z.string().length(CUID_LENGTH),
    ]),
    z.boolean()
  )
}

export function sortingSchema({
  z,
  contactFields,
}: { z: ZNamespace; contactFields: ContactFields[] }) {
  return z.array(
    z.object({
      id: z.string().refine(
        (val: string) => {
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
}

export function customFieldSortingSchema(z: ZNamespace) {
  return z.array(
    z.object({
      id: z.string().length(CUID_LENGTH),
      desc: z.boolean(),
    })
  )
}

export function columnFiltersSchema({
  z,
  contactFields,
}: { z: ZNamespace; contactFields: ContactFields[] }) {
  return z.array(
    z.object({
      id: z.union([
        z.string().refine(
          (val: string) => {
            const contactField = contactFields.find(({ name }) => snakeToCamel(name) === val)

            return Boolean(contactField)
          },
          () => ({
            message: 'Column name is not valid.',
            path: ['id'],
          })
        ),
        z.string().length(CUID_LENGTH),
      ]),
      value: z.union([
        z.array(z.boolean()),
        z.array(z.string()),
        z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
      ]),
    })
  )
}

export function globalFilterSchema({ z }: { z: ZNamespace }) {
  return z.array(
    z.object({
      id: z.union([
        z.string().refine(
          (val: string) => {
            return (
              CONTACT_GLOBAL_SEARCH_FIELDS.includes(val) || val === CONTACT_DEFAULT_SEARCH_FIELD
            )
          },
          () => ({
            message: 'Column name is not valid.',
            path: ['id'],
          })
        ),
        z.string().length(CUID_LENGTH),
      ]),
      value: z.union([z.string(), z.number()]),
    })
  )
}

export function paginationPageSchema({ z }: { z: ZNamespace }) {
  return z.string().transform((val: string) => {
    return handleNumberInput(val, { min: DEFAULT_PAGE_INDEX })
  })
}

export function paginationPageSizeSchema({ z }: { z: ZNamespace }) {
  return z.string().transform((val: string) => {
    const pageSize = DEFAULT_PAGE_SIZES.includes(Number.parseInt(val))
      ? val
      : `${DEFAULT_PAGE_SIZE}`
    return handleNumberInput(pageSize, {
      min: DEFAULT_PAGE_SIZE,
      max: DEFAULT_MAX_PAGE_SIZE,
    })
  })
}
