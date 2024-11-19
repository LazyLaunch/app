import { useEffect, useRef, useState, type CSSProperties } from 'react'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { ContactDataTableToolbar } from '@/components/contacts/data-table/contact-data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { ContactFields, ContactProps, GlobalContactColumnFilter } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

import { useFilterState } from '@/components/data-table/search-params-hooks/use-filter-state'
import { useGlobalFilterState } from '@/components/data-table/search-params-hooks/use-global-filter-state'
import { usePaginationState } from '@/components/data-table/search-params-hooks/use-pagination-state'
import { useSortingState } from '@/components/data-table/search-params-hooks/use-sorting-state'
import { useViewState } from '@/components/data-table/search-params-hooks/use-view-state'
import type { ContactTabFilterEnum } from '@/enums'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onDelete: (id: string) => void
    onApplyAdvancedFilter: (filteredData: ContactProps[]) => void
    setTotal: (count: number) => void
  }
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

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
}

export interface SearchParamProps {
  tab: ContactTabFilterEnum.QUICK_SEARCH | ContactTabFilterEnum.ADVANCED_FILTER
  page: number
  pageSize: number
  search: GlobalContactColumnFilter[]
  view: VisibilityState
  filter: ColumnFiltersState
  sort: SortingState
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
}

export function DataTable({
  data,
  columns,
  className,
  reqFilter,
  total,
  csrfToken,
  ids,
  customFields = [],
  contactFields = [],
  searchParams,
}: DataTableProps) {
  const isDry = useRef<boolean>(true)
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

  const table = useReactTable<ContactProps>({
    data: _data,
    columns,
    rowCount: _total,
    initialState: {
      globalFilter: [],
      columnFilters: [],
    },
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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
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

  usePaginationState(_pagination)
  useGlobalFilterState(globalFilter)
  useViewState({ contactFields, columnVisibility })
  useSortingState({ sorting, contactFields })
  useFilterState({ columnFilters, contactFields })

  useEffect(() => {
    if (isDry.current) {
      isDry.current = false
      return
    }

    const customColumnIds = customFields.map((f) => f.id)
    const formData = new FormData()
    for (const [key, value] of Object.entries({ ..._pagination, ...ids, csrfToken })) {
      formData.append(key, value?.toString() || '')
    }
    globalFilter && formData.append('globalFilter', JSON.stringify(globalFilter))
    formData.append(
      'columnFilters',
      JSON.stringify(columnFilters.filter((c) => !customColumnIds.includes(c.id)))
    )
    formData.append(
      'customColumnFilters',
      JSON.stringify(columnFilters.filter((c) => customColumnIds.includes(c.id)))
    )
    formData.append(
      'sorting',
      JSON.stringify(sorting.filter((c) => !customColumnIds.includes(c.id)))
    )
    formData.append(
      'customFieldsSorting',
      JSON.stringify(sorting.filter((c) => customColumnIds.includes(c.id)))
    )

    const doRequest = async () => {
      const { data } = await reqFilter(formData)
      setData(data.contacts)
      setTotal(data.contactsTotal)
    }

    doRequest()
  }, [_pagination, globalFilter, sorting, columnFilters, reqFilter, ids, csrfToken, customFields])

  return (
    <div className={cn(className, 'space-y-4')}>
      <ContactDataTableToolbar
        {...{ table, activeTab: searchParams.tab, customFields, csrfToken, ids, contactFields }}
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
