import type { SelectFilter } from '@/db/schema'
import {
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
  type Updater,
} from '@tanstack/react-table'

export type SegmentsState = Pick<SelectFilter, 'id' | 'name'>[]
export interface SegmentsTableState {
  segments: SegmentsState
}

export interface SegmentsOptions {
  enableSegments?: boolean
  onSegmentsChange?: OnChangeFn<SegmentsState>
}

export interface SegmentsInstance {
  setSegments: (updater: Updater<SegmentsState>) => void
  updateSegments: (id: string, data: Pick<SelectFilter, 'id' | 'name'>) => void
  getSegment: (id: string) => Pick<SelectFilter, 'id' | 'name'> | undefined
}

export const SegmentsFeature: TableFeature<any> = {
  getInitialState: (state): SegmentsTableState => {
    return {
      segments: [],
      ...state,
    }
  },

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): SegmentsOptions => {
    return {
      enableSegments: true,
      onSegmentsChange: makeStateUpdater('segments', table),
    } as SegmentsOptions
  },
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setSegments = (updater) => {
      const safeUpdater: Updater<SegmentsState> = (old) => {
        return functionalUpdate(updater, old)
      }
      return table.options.onSegmentsChange?.(safeUpdater)
    }
    table.getSegment = (id) => {
      return table.getState().segments.find((segment) => segment.id === id)
    }
    table.updateSegments = (id: string, data: Pick<SelectFilter, 'id' | 'name'>) => {
      const segments = table
        .getState()
        .segments.map((segment) => (segment.id === id ? { ...segment, ...data } : segment))
      const safeUpdater: Updater<SegmentsState> = (old) => {
        return functionalUpdate(segments, old)
      }
      return table.options.onSegmentsChange?.(safeUpdater)
    }
  },
}
