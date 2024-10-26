import type { Table } from '@tanstack/react-table'
import { FileText, Monitor, Server, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
import { ContactSourceEnum } from '@/types'

interface ContactDataTableToolbarProps<TData> {
  table: Table<TData>
}

const subscribed = [
  {
    label: 'Yes',
    value: true,
    icon: ThumbsUp,
  },
  {
    label: 'No',
    value: false,
    icon: ThumbsDown,
  },
]

const source = [
  {
    label: 'App',
    value: ContactSourceEnum.APP,
    icon: Monitor,
  },
  {
    label: 'Api',
    value: ContactSourceEnum.API,
    icon: Server,
  },
  {
    label: 'Form',
    value: ContactSourceEnum.FORM,
    icon: FileText,
  },
]

export function ContactDataTableToolbar<TData>({ table }: ContactDataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const searchValue = table.getColumn('email')?.getFilterValue() as string
  const searchForm = useForm({
    defaultValues: {
      email: searchValue ?? '',
    },
  })

  useEffect(() => {
    if (typeof searchValue === 'undefined') {
      searchForm.reset()
    }
  }, [searchValue, searchForm.reset])

  function onSearchSubmit(values: { email: string }) {
    table.getColumn('email')?.setFilterValue(values.email)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <form onSubmit={searchForm.handleSubmit(onSearchSubmit)}>
          <Input
            {...searchForm.register('email')}
            placeholder="Filter by emails..."
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </form>
        {table.getColumn('source') && (
          <DataTableFacetedFilter<TData, any>
            column={table.getColumn('source')}
            title="Source"
            options={source}
          />
        )}
        {table.getColumn('subscribed') && (
          <DataTableFacetedFilter<TData, any>
            column={table.getColumn('subscribed')}
            title="Subscribed"
            options={subscribed}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions<TData> table={table} />
    </div>
  )
}
