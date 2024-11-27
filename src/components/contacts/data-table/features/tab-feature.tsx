import {
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
  type Updater,
} from '@tanstack/react-table'

import { ContactTabFilterEnum } from '@/enums'

export type TabState =
  | ContactTabFilterEnum.QUICK_SEARCH
  | ContactTabFilterEnum.ADVANCED_FILTER
  | null

export interface TabTableState {
  tab: TabState
}

export interface TabOptions {
  enableTab?: boolean
  onTabChange?: OnChangeFn<TabState>
}

export interface TabInstance {
  setTab: (updater: Updater<TabState>) => void
}

export const TabFeature: TableFeature<any> = {
  getInitialState: (state): TabTableState => {
    return {
      tab: ContactTabFilterEnum.QUICK_SEARCH,
      ...state,
    }
  },
  getDefaultOptions: <TData extends RowData>(table: Table<TData>): TabOptions => {
    return {
      enableTab: true,
      onTabChange: makeStateUpdater('tab', table),
    } as TabOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setTab = (updater) => {
      const safeUpdater: Updater<TabState> = (old) => {
        return functionalUpdate(updater, old)
      }
      if (table.options.onTabChange) makeStateUpdater('tab', table)(safeUpdater)
      return table.options.onTabChange?.(updater)
    }
  },
}
