import {
  createSerializer,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs'
import { z } from 'zod'

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constants'
import { ContactTabFilterEnum } from '@/enums'

import type { ContactFields, GlobalContactColumnFilter } from '@/db/models/contact'
import { paginationPageStateParser } from '@/parsers/contacts-page'
import {
  columnFiltersSchema,
  globalFilterSchema,
  sortingSchema,
  viewItemSchema,
} from '@/validations/contacts-page'
import type { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'

interface QueryParamProps {
  tab?: ContactTabFilterEnum.QUICK_SEARCH | ContactTabFilterEnum.ADVANCED_FILTER | null
  segmentId?: string
  page?: number
  pageSize?: number
  sort?: SortingState
  search?: GlobalContactColumnFilter[]
  view?: VisibilityState
  filter?: ColumnFiltersState
}

interface QueryParamOptions {
  contactFields?: ContactFields[]
}

export function setQueryParams(props: QueryParamProps, options?: QueryParamOptions) {
  const { contactFields = [] } = options || {}
  const url = new URL(window.location.href)
  const searchParams = {
    tab: parseAsStringLiteral([
      ContactTabFilterEnum.QUICK_SEARCH,
      ContactTabFilterEnum.ADVANCED_FILTER,
    ]).withDefault(ContactTabFilterEnum.QUICK_SEARCH),
    segmentId: parseAsString.withDefault(''),
    page: paginationPageStateParser().withDefault(DEFAULT_PAGE_INDEX),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    sort: parseAsJson<SortingState>(sortingSchema({ z, contactFields }).parse).withDefault([
      { id: 'createdAt', desc: true },
    ]),
    search: parseAsJson<GlobalContactColumnFilter[]>(globalFilterSchema({ z }).parse).withDefault(
      []
    ),
    view: parseAsJson<VisibilityState>(viewItemSchema({ z, contactFields }).parse).withDefault({}),
    filter: parseAsJson<ColumnFiltersState>(
      columnFiltersSchema({ z, contactFields }).parse
    ).withDefault([]),
  }
  const serialize = createSerializer(searchParams)
  const params = serialize(url, props)
  window.history.replaceState(null, '', params)
}
