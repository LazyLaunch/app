import type { FilterCondition } from '@/db/models/filter'
import {
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
  type Updater,
} from '@tanstack/react-table'

export type FilterConditionsState = FilterCondition[]
export interface FilterConditionsTableState {
  filterConditions: FilterConditionsState
}

export interface FilterConditionsOptions {
  enableFilterConditions?: boolean
  onFilterConditionsChange?: OnChangeFn<FilterConditionsState>
}

export interface FilterConditionsInstance {
  setFilterConditions: (updater: Updater<FilterConditionsState>) => void
}

export const FilterConditionsFeature: TableFeature<any> = {
  getInitialState: (state): FilterConditionsTableState => {
    return {
      filterConditions: [],
      ...state,
    }
  },

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): FilterConditionsOptions => {
    return {
      enableFilterConditions: true,
      onFilterConditionsChange: makeStateUpdater('filterConditions', table),
    } as FilterConditionsOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setFilterConditions = (updater) => {
      const safeUpdater: Updater<FilterConditionsState> = (old) => {
        return functionalUpdate(updater, old)
      }
      return table.options.onFilterConditionsChange?.(safeUpdater)
    }
  },
}
