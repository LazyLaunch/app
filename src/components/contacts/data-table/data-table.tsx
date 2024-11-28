import { useEffect, useState, type CSSProperties } from 'react'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type InitialTableState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { ContactsDataTableToolbar } from '@/components/contacts/contacts-table/contacts-data-table-toolbar'
import { DataTablePagination } from '@/components/contacts/data-table/data-table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { setQueryParams } from '@/lib/query-serializer'
import { cn } from '@/lib/utils'

import {
  FilterConditionsFeature,
  type FilterConditionsInstance,
  type FilterConditionsOptions,
  type FilterConditionsTableState,
} from '@/components/contacts/contacts-table/features/filter-conditions-feature'
import {
  SegmentIdFeature,
  type SegmentIdInstance,
  type SegmentIdOptions,
  type SegmentIdState,
  type SegmentIdTableState,
} from '@/components/contacts/contacts-table/features/segment-id-feature'
import {
  SegmentsFeature,
  type SegmentsInstance,
  type SegmentsOptions,
  type SegmentsTableState,
} from '@/components/contacts/contacts-table/features/segments-feature'
import {
  SubmitFilterConditionsFeature,
  type SubmitFilterConditionsInstance,
  type SubmitFilterConditionsOptions,
  type SubmitFilterConditionsTableState,
} from '@/components/contacts/contacts-table/features/submit-filter-conditions-feature'
import {
  SubmitQuickFilterFeature,
  type SubmitQuickFilterInstance,
  type SubmitQuickFilterOptions,
  type SubmitQuickFilterTableState,
  type TablePaginationState,
} from '@/components/contacts/contacts-table/features/submit-quick-filter-feature'
import {
  TabFeature,
  type TabInstance,
  type TabOptions,
  type TabTableState,
} from '@/components/contacts/contacts-table/features/tab-feature'
import type { ContactFields, ContactProps, GlobalContactColumnFilter } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import type { FilterCondition } from '@/db/models/filter'
import type { SelectFilter } from '@/db/schema'
import type { ContactTabFilterEnum } from '@/enums'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onDelete: (id: string) => void
    onApplyAdvancedFilter: (filteredData: ContactProps[]) => void
    setTotal: (count: number) => void
  }
  interface TableState extends SegmentIdTableState {}
  interface TableState extends FilterConditionsTableState {}
  interface TableState extends SegmentsTableState {}
  interface TableState extends SubmitQuickFilterTableState {}
  interface TableState extends SubmitFilterConditionsTableState {}
  interface TableState extends TabTableState {}
  interface TableOptionsResolved<TData extends RowData> extends SegmentIdOptions {}
  interface TableOptionsResolved<TData extends RowData> extends FilterConditionsOptions {}
  interface TableOptionsResolved<TData extends RowData> extends SegmentsOptions {}
  interface TableOptionsResolved<TData extends RowData> extends SubmitQuickFilterOptions {}
  interface TableOptionsResolved<TData extends RowData> extends SubmitFilterConditionsOptions {}
  interface TableOptionsResolved<TData extends RowData> extends TabOptions {}
  interface Table<TData extends RowData> extends SegmentIdInstance {}
  interface Table<TData extends RowData> extends FilterConditionsInstance {}
  interface Table<TData extends RowData> extends SegmentsInstance {}
  interface Table<TData extends RowData> extends SubmitQuickFilterInstance {}
  interface Table<TData extends RowData> extends SubmitFilterConditionsInstance {}
  interface Table<TData extends RowData> extends TabInstance {}
}

export function getCommonPinningStyles(column: Column<ContactProps>): CSSProperties {
  const isPinned = column.getIsPinned()

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    // opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export interface SearchParamProps {
  tab: ContactTabFilterEnum.QUICK_SEARCH | ContactTabFilterEnum.ADVANCED_FILTER
  page: number
  pageSize: number
  search: GlobalContactColumnFilter[]
  view: VisibilityState
  filter: ColumnFiltersState
  sort: SortingState
  filterId: string
}

interface DataTableProps {
  columns: ColumnDef<ContactProps, any>[]
  data: ContactProps[]
  className: string
  reqFilter: (data: FormData) => Promise<any>
  csrfToken: string
  ids: {
    projectId: string
    teamId: string
  }
  total: number
  customFields: CustomFieldProps[]
  contactFields: ContactFields[]
  searchParams: SearchParamProps
  filters: SelectFilter[]
  filterConditions: FilterCondition[]
}

export function DataTable({
  data,
  columns,
  className,
  total,
  csrfToken,
  ids,
  customFields = [],
  contactFields = [],
  searchParams,
  filters,
  filterConditions,
}: DataTableProps) {
  const [_data, setData] = useState<ContactProps[]>(data)
  const [_total, setTotal] = useState<number>(total)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState<GlobalContactColumnFilter[]>(searchParams.search)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(searchParams.view)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(searchParams.filter)
  const [sorting, setSorting] = useState<SortingState>(searchParams.sort)
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'email'],
    right: ['actions'],
  })

  const [_pagination, setPagination] = useState<TablePaginationState>({
    pageIndex: searchParams.page,
    pageSize: searchParams.pageSize,
  })
  const segmentId = searchParams.filterId

  const table = useReactTable<ContactProps>({
    _features: [
      SegmentIdFeature,
      SegmentsFeature,
      FilterConditionsFeature,
      SubmitQuickFilterFeature,
      SubmitFilterConditionsFeature,
      TabFeature,
    ],
    data: _data,
    columns,
    rowCount: _total,
    initialState: {
      tab: searchParams.tab,
      globalFilter: [],
      columnFilters: [],
      segmentId,
      segments: filters,
      filterConditions,
      customColumnIds: customFields.map((f) => f.id),
      ids,
      csrfToken,
    } as InitialTableState & { segmentId: SegmentIdState },
    state: {
      pagination: _pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnPinning,
      globalFilter,
    },
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    onSubmitQuickFilter: (options) => !options?.skipOnChange && setQueryParams({ segmentId: '' }),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onTabChange: (tab) => setQueryParams({ tab } as TabTableState),
    onSegmentIdChange: (segmentId) => setQueryParams({ segmentId } as { segmentId: string }),
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onDelete: (id: string) => setData((prevState) => prevState.filter((d) => d.id !== id)),
      onApplyAdvancedFilter: (filteredData: ContactProps[]) => setData(filteredData),
      setTotal: (count: number) => setTotal(count),
    },
    manualPagination: true,
    enableColumnPinning: true,
    // columnResizeMode: 'onChange',
  })

  useEffect(() => {
    setQueryParams({ filter: columnFilters }, { contactFields })
  }, [columnFilters, contactFields])
  useEffect(() => {
    setQueryParams({ view: columnVisibility }, { contactFields })
  }, [columnVisibility, contactFields])
  useEffect(() => setQueryParams({ search: globalFilter }), [globalFilter])
  useEffect(
    () => setQueryParams({ page: _pagination.pageIndex, pageSize: _pagination.pageSize }),
    [_pagination]
  )
  useEffect(() => setQueryParams({ sort: sorting }, { contactFields }), [sorting, contactFields])

  return (
    <div className={cn(className, 'space-y-4')}>
      <ContactsDataTableToolbar
        {...{
          table,
          filters,
          activeTab: searchParams.tab,
          customFields,
          csrfToken,
          ids,
          contactFields,
        }}
      />
      <div className="rounded-md overflow-hidden border bg-background">
        <Table className="overflow-x-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="bg-background"
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ ...getCommonPinningStyles(header.column) }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="bg-background"
                      key={cell.id}
                      style={{ ...getCommonPinningStyles(cell.column) }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
