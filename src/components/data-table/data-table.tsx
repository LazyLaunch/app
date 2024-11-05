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

import type { ContactProps, GlobalContactColumnFilter } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onDelete: (id: string) => void
  }
}

export function getCommonPinningStyles(column: Column<ContactProps>): CSSProperties {
  const isPinned = column.getIsPinned()

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
}

interface DataTableProps {
  columns: ColumnDef<ContactProps, any>[]
  data: ContactProps[]
  className: string
  children: any
  reqFilter: (data: FormData) => Promise<any>
  csrfToken: string
  ids?: Record<string, string>
  pagination: TablePaginationState
  total: number
  customFields: CustomFieldProps[]
}

export function DataTable({
  data,
  columns,
  className,
  children,
  reqFilter,
  total,
  csrfToken,
  pagination,
  ids = {},
  customFields = [],
}: DataTableProps) {
  const isDry = useRef<boolean>(true)
  const [_data, setData] = useState<ContactProps[]>(data)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState<GlobalContactColumnFilter[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'email'],
    right: ['actions'],
  })

  const [_pagination, setPagination] = useState<TablePaginationState>(pagination)

  const table = useReactTable<ContactProps>({
    data: _data,
    columns,
    rowCount: total,
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
    getRowId: (row) => (row as unknown as { id: string }).id,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onDelete: (id: string) =>
        setData((prevState) => prevState.filter((d) => (d as unknown as { id: string }).id !== id)),
    },
    manualPagination: true,
    enableColumnPinning: true,
    // columnResizeMode: 'onChange',
  })

  useEffect(() => {
    if (isDry.current) {
      isDry.current = false
      return
    }

    // const filters = [{ id: 'firstName', desc: true }, { id: 'lastName', desc: false }];
    // const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    // const url = `${window.location.pathname}?filters=${encodedFilters}`;
    // window.history.replaceState(null, '', url);
    // const parsedFilters = JSON.parse(decodeURIComponent(new URLSearchParams(window.location.search).get('filters')));

    const customColumnTags = customFields.map((f) => f.tag)
    const formData = new FormData()
    for (const [key, value] of Object.entries({ ..._pagination, ...ids, csrfToken })) {
      formData.append(key, value?.toString() || '')
    }
    globalFilter && formData.append('globalFilter', JSON.stringify(globalFilter))
    formData.append(
      'columnFilters',
      JSON.stringify(columnFilters.filter((c) => !customColumnTags.includes(c.id)))
    )
    const customColumnFilters = []
    for (const filter of columnFilters) {
      const field = customFields.find((cf) => cf.tag === filter.id)
      field && customColumnFilters.push({ ...filter, id: field.id })
    }
    formData.append('customColumnFilters', JSON.stringify(customColumnFilters))

    formData.append(
      'sorting',
      JSON.stringify(sorting.filter((c) => !customColumnTags.includes(c.id)))
    )
    const customFieldsSorting = []
    for (const sort of sorting) {
      const field = customFields.find((cf) => cf.tag === sort.id)
      field && customFieldsSorting.push({ ...sort, id: field.id })
    }
    formData.append('customFieldsSorting', JSON.stringify(customFieldsSorting))

    const doRequest = async () => {
      const { data } = await reqFilter(formData)
      setData(data)
    }

    doRequest()
  }, [_pagination, globalFilter, sorting, columnFilters, reqFilter, ids, csrfToken, customFields])

  return (
    <div className={cn(className, 'space-y-4')}>
      {children({ table, customFields, csrfToken })}
      <div className="rounded-md border bg-background">
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
