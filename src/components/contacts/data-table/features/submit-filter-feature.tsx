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

export interface SubmitFilterProps {
  pagination?: TablePaginationState
  globalFilter?: GlobalContactColumnFilter[]
  columnFilters?: ColumnFiltersState
  sorting?: SortingState
}

export interface SubmitFilterTableState {
  customColumnIds: string[]
  ids: object
  csrfToken: string
}

export interface SubmitFilterOptions {
  enableSubmitFilter?: boolean
  onSubmitFilter?: (options?: { skipOnChange: boolean } | undefined) => void
}

export interface SubmitFilterInstance {
  doFilter: (filter: SubmitFilterProps, options?: { skipOnChange: boolean } | undefined) => void
}

export const SubmitFilterFeature: TableFeature<any> = {
  getInitialState: (state): SubmitFilterTableState => {
    return {
      customColumnIds: [],
      ids: {},
      csrfToken: '',
      ...state,
    }
  },

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): SubmitFilterOptions => {
    return {
      enableSubmitFilter: true,
    } as SubmitFilterOptions
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
      table.options.onSubmitFilter?.(options)
    }
  },
}
