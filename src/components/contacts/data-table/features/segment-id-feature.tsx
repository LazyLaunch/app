import {
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
  type Updater,
} from '@tanstack/react-table'

export type SegmentIdState = string
export interface SegmentIdTableState {
  segmentId: SegmentIdState
}

export interface SegmentIdOptions {
  enableSegmentId?: boolean
  onSegmentIdChange?: OnChangeFn<SegmentIdState>
}

export interface SegmentIdInstance {
  setSegmentId: (updater: Updater<SegmentIdState>) => void
}

export const SegmentIdFeature: TableFeature<any> = {
  getInitialState: (state): SegmentIdTableState => {
    return {
      segmentId: '',
      ...state,
    }
  },

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): SegmentIdOptions => {
    return {
      enableSegmentId: true,
      onSegmentIdChange: makeStateUpdater('segmentId', table),
    } as SegmentIdOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setSegmentId = (updater) => {
      const safeUpdater: Updater<SegmentIdState> = (old) => {
        return functionalUpdate(updater, old)
      }
      return table.options.onSegmentIdChange?.(safeUpdater)
    }
  },
}
