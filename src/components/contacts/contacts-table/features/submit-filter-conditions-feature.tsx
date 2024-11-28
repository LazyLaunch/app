import { actions } from 'astro:actions'

import type { TablePaginationState } from '@/components/contacts/contacts-table/features/submit-quick-filter-feature'
import type { ContactProps } from '@/db/models/contact'
import type { FilterCondition } from '@/db/models/filter'
import type { RowData, SortingState, Table, TableFeature } from '@tanstack/react-table'

export interface SubmitFilterConditionsTableState {
  customColumnIds: string[]
  ids: object
  csrfToken: string
}

export interface SubmitFilterConditionsOptions {
  enableSubmitFilterConditions?: boolean
}

export interface SubmitFilterConditionsProps {
  pagination?: TablePaginationState
  sorting?: SortingState
  filterConditions?: FilterCondition[]
}

export interface SubmitFilterConditionsInstance {
  doSubmitFilterConditions: (filter: SubmitFilterConditionsProps) => void
}

export const SubmitFilterConditionsFeature: TableFeature<any> = {
  getInitialState: (state): SubmitFilterConditionsTableState => {
    return {
      customColumnIds: [],
      ids: {},
      csrfToken: '',
      ...state,
    }
  },
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): SubmitFilterConditionsOptions => {
    return {
      enableSubmitFilterConditions: true,
    } as SubmitFilterConditionsOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.doSubmitFilterConditions = (filter) => {
      const { ids, customColumnIds, pagination, csrfToken, sorting, filterConditions } =
        table.getState()
      const params = {
        pagination,
        sorting,
        filterConditions,
        ...filter,
      }

      const formData = new FormData()
      for (const [key, value] of Object.entries({
        ...params.pagination,
        ...ids,
        csrfToken,
      })) {
        formData.append(key, value?.toString() || '')
      }
      formData.append('filterConditions', JSON.stringify(params.filterConditions))
      formData.append(
        'sorting',
        JSON.stringify(params.sorting.filter((c) => !customColumnIds.includes(c.id)))
      )
      formData.append(
        'customFieldsSorting',
        JSON.stringify(params.sorting.filter((c) => customColumnIds.includes(c.id)))
      )

      const doRequest = async () => {
        const { data } = await actions.filter.contacts(formData)
        table.options.meta!.onApplyAdvancedFilter?.(data!.contacts as ContactProps[])
        table.options.meta!.setTotal?.(data!.contactsTotal as number)
        table.setFilterConditions(params.filterConditions)
        table.setColumnFilters([])
        table.setGlobalFilter([])
      }

      doRequest()
    }
  },
}
