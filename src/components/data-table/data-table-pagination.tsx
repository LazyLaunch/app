import { functionalUpdate, type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_PAGE_SIZES } from '@/constants'

import type { TablePaginationState } from '@/components/contacts/data-table/features/submit-quick-filter-feature'
import type { ContactProps } from '@/db/models/contact'
import { ContactTabFilterEnum } from '@/enums'

interface DataTablePaginationProps {
  table: Table<ContactProps>
}

export function DataTablePagination({ table }: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} to{' '}
        {table.getFilteredRowModel().rows.length} of {table.getRowCount()} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              let pagination: TablePaginationState = {} as TablePaginationState
              table.setPagination((old) => {
                const pageSize = Math.max(1, functionalUpdate(Number(value), old.pageSize))
                const topRowIndex = old.pageSize * old.pageIndex!
                const pageIndex = Math.floor(topRowIndex / pageSize)
                pagination = {
                  ...old,
                  pageIndex,
                  pageSize,
                }

                return pagination
              })

              if (table.getState().tab === ContactTabFilterEnum.QUICK_SEARCH) {
                table.doFilter({ pagination })
              } else {
                table.doSubmitFilterConditions({ pagination })
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {DEFAULT_PAGE_SIZES.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              table.firstPage()
              const pagination = {
                pageIndex: 0,
                pageSize: table.getState().pagination.pageSize,
              }

              if (table.getState().tab === ContactTabFilterEnum.QUICK_SEARCH) {
                table.doFilter({ pagination })
              } else {
                table.doSubmitFilterConditions({ pagination })
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              table.previousPage()
              const pagination = {
                pageIndex: table.getState().pagination.pageIndex - 1,
                pageSize: table.getState().pagination.pageSize,
              }

              if (table.getState().tab === ContactTabFilterEnum.QUICK_SEARCH) {
                table.doFilter({ pagination })
              } else {
                table.doSubmitFilterConditions({ pagination })
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              table.nextPage()
              const pagination = {
                pageIndex: table.getState().pagination.pageIndex + 1,
                pageSize: table.getState().pagination.pageSize,
              }
              if (table.getState().tab === ContactTabFilterEnum.QUICK_SEARCH) {
                table.doFilter({ pagination })
              } else {
                table.doSubmitFilterConditions({ pagination })
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              table.lastPage()
              const pagination = {
                pageIndex: table.getPageCount() - 1,
                pageSize: table.getState().pagination.pageSize,
              }
              if (table.getState().tab === ContactTabFilterEnum.QUICK_SEARCH) {
                table.doFilter({ pagination })
              } else {
                table.doSubmitFilterConditions({ pagination })
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
