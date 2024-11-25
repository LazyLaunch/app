import { createParser, parseAsInteger, parseAsString } from 'nuqs'

import { CUID_LENGTH, DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constants'
import { ContactTabFilterEnum } from '@/enums'
import {
  columnFiltersSchema,
  contactTabSchema,
  customFieldSortingSchema,
  globalFilterSchema,
  paginationPageSchema,
  paginationPageSizeSchema,
  sortingSchema,
  viewItemSchema,
} from '@/validations/contacts-page'

import type {
  ContactColumnFilters,
  ContactCustomColumnFilters,
  ContactFields,
  ContactSortFields,
  GlobalContactColumnFilter,
} from '@/db/models/contact'
import type { ZNamespace } from '@/types'
import type { VisibilityState } from '@tanstack/react-table'

export function paginationPageStateParser() {
  return createParser({
    parse: (query) => {
      const page = parseAsInteger.parse(query)
      return page === null ? null : page - 1
    },
    serialize: (value) => {
      return parseAsInteger.serialize(value + 1)
    },
  })
}

export function filterIdStateParser() {
  return createParser({
    parse: (query) => {
      const filterId = parseAsString.parse(query)
      return filterId?.length === CUID_LENGTH ? filterId : null
    },
    serialize: (value) => {
      return parseAsString.serialize(value)
    },
  })
}

export function serverFilterIdStateParser({
  z,
  data,
}: { z: ZNamespace; data: string | null }): string {
  try {
    z.string().length(CUID_LENGTH).parse(data)
    return data as string
  } catch {
    return ''
  }
}

export function serverPaginationPageStateParser({
  z,
  data,
}: { z: ZNamespace; data: string | null }): number {
  try {
    paginationPageSchema({ z }).parse(data)
    return Number(data) - 1
  } catch {
    return DEFAULT_PAGE_INDEX
  }
}

export function serverPaginationPageSizeStateParser({
  z,
  data,
}: { z: ZNamespace; data: string | null }): number {
  try {
    paginationPageSizeSchema({ z }).parse(data)
    return Number(data)
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

export function getSortingStateParser({
  z,
  contactFields,
  data,
}: { z: ZNamespace; data: string | null; contactFields: ContactFields[] }): ContactSortFields {
  try {
    const parsed = JSON.parse(data ?? '')
    z.union([sortingSchema({ z, contactFields }), customFieldSortingSchema(z)]).parse(parsed)

    return parsed
  } catch {
    return [{ id: 'createdAt', desc: true }]
  }
}

export function getViewStateParser({
  z,
  data,
  contactFields,
}: { z: ZNamespace; data: string | null; contactFields: ContactFields[] }): VisibilityState {
  try {
    const parsed = JSON.parse(data ?? '')
    viewItemSchema({ z, contactFields }).parse(parsed)

    return parsed
  } catch {
    return {}
  }
}

export function getContactTabStateParser({
  z,
  data,
}: { z: ZNamespace; data: string | null }):
  | ContactTabFilterEnum.QUICK_SEARCH
  | ContactTabFilterEnum.ADVANCED_FILTER {
  try {
    contactTabSchema({ z }).parse(data)
    return (data || ContactTabFilterEnum.QUICK_SEARCH) as ContactTabFilterEnum
  } catch {
    return ContactTabFilterEnum.QUICK_SEARCH
  }
}

export function getFilterStateParser({
  z,
  data,
  contactFields,
}: { z: ZNamespace; data: string | null; contactFields: ContactFields[] }):
  | ContactColumnFilters
  | ContactCustomColumnFilters {
  try {
    const parsed: ContactColumnFilters | ContactCustomColumnFilters = JSON.parse(data ?? '')
    columnFiltersSchema({ z, contactFields }).parse(parsed)
    return parsed
  } catch {
    return []
  }
}

export function getGlobalFilterStateParser({
  z,
  data,
}: { z: ZNamespace; data: string | null }): GlobalContactColumnFilter[] {
  try {
    const parsed: GlobalContactColumnFilter[] = JSON.parse(data ?? '')
    globalFilterSchema({ z }).parse(parsed)
    return parsed
  } catch {
    return []
  }
}
