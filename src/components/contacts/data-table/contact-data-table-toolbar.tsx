import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'

import type { Table } from '@tanstack/react-table'

interface ContactDataTableToolbarProps<TData> {
  table: Table<TData>
}

export function ContactDataTableToolbar<TData>({ table }: ContactDataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">Reset</div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
