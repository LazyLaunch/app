import { NuqsAdapter } from 'nuqs/adapters/react'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table'
import { AlignLeft, Calendar, HashIcon, Lock, ToggleLeftIcon } from 'lucide-react'
import { useState } from 'react'

import { CustomFieldRowActions } from '@/components/custom-fields/table/custom-field-row-actions'
import { CustomFieldTableToolbar } from '@/components/custom-fields/table/custom-field-table-toolbar'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CustomFieldList } from '@/db/models/custom-field'
import { tagWithPlaceholder } from '@/lib/to-tag'
import { cn, formatFieldName } from '@/lib/utils'

import { Checkbox } from '@/components/ui/checkbox'
import { CustomFieldTypeEnum } from '@/enums'

const ICONS: Record<CustomFieldTypeEnum, any> = {
  [CustomFieldTypeEnum.STRING]: AlignLeft,
  [CustomFieldTypeEnum.NUMBER]: HashIcon,
  [CustomFieldTypeEnum.BOOLEAN]: ToggleLeftIcon,
  [CustomFieldTypeEnum.DATE]: Calendar,
}

function contactDataTableColumns({
  csrfToken,
  setRowSelection,
  rowSelection,
  projectId,
  isAnyCustomFields,
}: {
  csrfToken: string
  rowSelection: Record<string, boolean>
  setRowSelection: (state: RowSelectionState) => void
  projectId: string
  isAnyCustomFields: boolean
}): ColumnDef<CustomFieldList>[] {
  return [
    {
      id: 'select',
      header: ({ table }) =>
        isAnyCustomFields ? (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ) : (
          <Lock className="size-4 text-muted-foreground" />
        ),
      cell: ({ row }) =>
        row.original.isCustomField ? (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ) : (
          <Lock className="size-4 text-muted-foreground" />
        ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader<CustomFieldList, any> column={column} title="Column Name" />
      ),
      cell: ({ row }) => <div className="font-medium">{formatFieldName(row.getValue('name'))}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader<CustomFieldList, any> column={column} title="Column Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as CustomFieldTypeEnum
        const Icon = ICONS[type]
        return (
          <div className="flex items-center space-x-2">
            <Icon className="size-4 text-muted-foreground" />
            <span>{type}</span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'tag',
      header: ({ column }) => (
        <DataTableColumnHeader<CustomFieldList, any> column={column} title="Tag" />
      ),
      cell: ({ row }) => <div>{tagWithPlaceholder(row.getValue('tag'))}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader<CustomFieldList, any> column={column} title="Updated At" />
      ),
      cell: ({ row }) =>
        row.original.isCustomField ? <div>{row.getValue('updatedAt')}</div> : '-',
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader<CustomFieldList, any> column={column} title="Created At" />
      ),
      cell: ({ row }) =>
        row.original.isCustomField ? <div>{row.getValue('createdAt')}</div> : '-',
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row, table }) =>
        row.original.isCustomField && (
          <CustomFieldRowActions
            row={row}
            table={table}
            setRowSelection={setRowSelection}
            rowSelection={rowSelection}
            csrfToken={csrfToken}
            projectId={projectId}
          />
        ),
    },
  ]
}

interface DataTableProps {
  className?: string
  data: CustomFieldList[]
  csrfToken: string
  total: number
  projectId: string
}

export function CustomFieldTable({ className, data, total, csrfToken, projectId }: DataTableProps) {
  const [_data, setData] = useState<CustomFieldList[]>(data)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const isAnyCustomFields = _data.some((d) => d.isCustomField)

  const table = useReactTable<CustomFieldList>({
    data: _data,
    columns: contactDataTableColumns({
      csrfToken,
      setRowSelection,
      rowSelection,
      projectId,
      isAnyCustomFields,
    }),
    rowCount: total,
    state: {
      rowSelection,
    },
    enableRowSelection: (row) => row.original.isCustomField,
    getRowId: (row) => (row as unknown as { id: string }).id,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onDelete: (fn) => fn({ data: _data, setData }),
    },
  })

  return (
    <NuqsAdapter>
      <div className={cn(className, 'space-y-4')}>
        <CustomFieldTableToolbar
          table={table}
          csrfToken={csrfToken}
          ids={Object.keys(rowSelection)}
          setRowSelection={setRowSelection}
        />
        <div className="rounded-md border bg-background">
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
    </NuqsAdapter>
  )
}
