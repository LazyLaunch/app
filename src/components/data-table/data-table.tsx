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

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onDelete?: (props: any) => void
  }
}

export function getCommonPinningStyles<TData>(column: Column<TData>): CSSProperties {
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className: string
  children: any
  onDelete?: (data: TData[], props: any) => void
  reqFilter: (data: FormData) => Promise<any>
  csrfToken: string
  ids?: Record<string, string>
  pagination: TablePaginationState
  total: number
}

export function DataTable<TData, TValue>({
  data,
  columns,
  className,
  children,
  onDelete = (data, props) => {},
  reqFilter,
  total,
  csrfToken,
  pagination,
  ids = {},
}: DataTableProps<TData, TValue>) {
  const isDry = useRef<boolean>(true)
  const [_data, setData] = useState<TData[]>(data)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'email'],
    right: ['actions'],
  })

  const [_pagination, setPagination] = useState<TablePaginationState>(pagination)

  const table = useReactTable<TData>({
    data: _data,
    columns,
    rowCount: total,
    state: {
      pagination: _pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnPinning,
    },
    onPaginationChange: setPagination,
    getRowId: (row) => (row as unknown as { id: string }).id,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onDelete: (props) => onDelete(data, props),
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

    const formData = new FormData()
    for (const [key, value] of Object.entries({ ..._pagination, ...ids, csrfToken })) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('sorting', JSON.stringify(sorting))
    formData.append('columnFilters', JSON.stringify(columnFilters))

    const doRequest = async () => {
      const { data } = await reqFilter(formData)
      setData(data)
    }

    doRequest()
  }, [_pagination, sorting, columnFilters])

  return (
    <div className={cn(className, 'space-y-4')}>
      {children({ table })}
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
                      style={{ ...getCommonPinningStyles<TData>(header.column) }}
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
                      style={{ ...getCommonPinningStyles<TData>(cell.column) }}
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
      <DataTablePagination<TData> table={table} />
    </div>
  )
}
