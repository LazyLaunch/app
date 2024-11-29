import { useState } from 'react'

import { GroupRowActions } from '@/components/groups/table/group-row-actions'
import { GroupTableColumnHeader } from '@/components/groups/table/group-table-column-header'
import { GroupsTableToolbar } from '@/components/groups/table/groups-table-toolbar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { SelectGroup } from '@/db/schema'
import { cn } from '@/lib/utils'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type TableMeta,
} from '@tanstack/react-table'

function groupsDataTableColumns({
  csrfToken,
  setRowSelection,
  rowSelection,
  ids,
}: {
  csrfToken: string
  rowSelection: Record<string, boolean>
  setRowSelection: (state: RowSelectionState) => void
  ids: {
    projectId: string
    teamId: string
  }
}): ColumnDef<SelectGroup>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <GroupTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <GroupTableColumnHeader column={column} title="Created At" />,
      cell: ({ row }) => <div>{row.getValue('createdAt')}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row, table }) => (
        <GroupRowActions
          row={row}
          table={table}
          setRowSelection={setRowSelection}
          rowSelection={rowSelection}
          csrfToken={csrfToken}
          ids={ids}
        />
      ),
    },
  ]
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onDeleteGroups: (
      fn: (params: { data: SelectGroup[]; setData: (data: SelectGroup[]) => void }) => void
    ) => void
  }
}

interface DataTableProps {
  className?: string
  data: SelectGroup[]
  csrfToken: string
  total: number
  ids: {
    projectId: string
    teamId: string
  }
}

export function GroupsTable({ className, data, total, csrfToken, ids }: DataTableProps) {
  const [_data, setData] = useState<SelectGroup[]>(data)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable<SelectGroup>({
    data: _data,
    columns: groupsDataTableColumns({
      csrfToken,
      setRowSelection,
      rowSelection,
      ids,
    }),
    rowCount: total,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onDeleteGroups: (fn) => fn({ data: _data, setData }),
    } as TableMeta<SelectGroup>,
  })

  return (
    <div className={cn(className, 'space-y-4')}>
      <GroupsTableToolbar
        table={table}
        csrfToken={csrfToken}
        ids={Object.keys(rowSelection)}
        projectId={ids.projectId}
        teamId={ids.teamId}
        setRowSelection={setRowSelection}
      />
      <div className="rounded-md overflow-hidden border bg-background">
        <Table className="overflow-x-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="bg-background" key={header.id} colSpan={header.colSpan}>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="bg-background" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  )
}
