import { actions } from 'astro:actions'

import type { GlobalContactColumnFilter } from '@/db/models/contact'
import type {
  ColumnFiltersState,
  RowData,
  SortingState,
  Table,
  TableFeature,
} from '@tanstack/react-table'

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
}

export interface SubmitQuickFilterProps {
  pagination?: TablePaginationState
  globalFilter?: GlobalContactColumnFilter[]
  columnFilters?: ColumnFiltersState
  sorting?: SortingState
}

export interface SubmitQuickFilterTableState {
  customColumnIds: string[]
  ids: object
  csrfToken: string
}

export interface SubmitQuickFilterOptions {
  enableSubmitQuickFilter?: boolean
  onSubmitQuickFilter?: (options?: { skipOnChange: boolean } | undefined) => void
}

export interface SubmitQuickFilterInstance {
  doFilter: (
    filter: SubmitQuickFilterProps,
    options?: { skipOnChange: boolean } | undefined
  ) => void
}

export const SubmitQuickFilterFeature: TableFeature<any> = {
  getInitialState: (state): SubmitQuickFilterTableState => {
    return {
      customColumnIds: [],
      ids: {},
      csrfToken: '',
      ...state,
    }
  },

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): SubmitQuickFilterOptions => {
    return {
      enableSubmitQuickFilter: true,
    } as SubmitQuickFilterOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.doFilter = (filter, options) => {
      const { ids, customColumnIds, pagination, csrfToken, globalFilter, columnFilters, sorting } =
        table.getState()
      const data = {
        pagination,
        globalFilter,
        columnFilters,
        sorting,
        ...filter,
      }

      const formData = new FormData()
      for (const [key, value] of Object.entries({ ...data.pagination, ...ids, csrfToken })) {
        formData.append(key, value?.toString() || '')
      }
      data.globalFilter && formData.append('globalFilter', JSON.stringify(data.globalFilter))
      formData.append(
        'columnFilters',
        JSON.stringify(data.columnFilters?.filter((c) => !customColumnIds.includes(c.id)))
      )
      formData.append(
        'customColumnFilters',
        JSON.stringify(data.columnFilters?.filter((c) => customColumnIds.includes(c.id)))
      )
      formData.append(
        'sorting',
        JSON.stringify(data.sorting.filter((c) => !customColumnIds.includes(c.id)))
      )
      formData.append(
        'customFieldsSorting',
        JSON.stringify(data.sorting.filter((c) => customColumnIds.includes(c.id)))
      )

      const doRequest = async () => {
        const { data } = await actions.contact.filters(formData)
        table.setSegmentId('')
        table.setFilterConditions([])
        table.options.meta?.onApplyAdvancedFilter(data?.contacts)
        table.options.meta?.setTotal(data?.contactsTotal)
      }

      doRequest()
      table.options.onSubmitQuickFilter?.(options)
    }
  },
}
