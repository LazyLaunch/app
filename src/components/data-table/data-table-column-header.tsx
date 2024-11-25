import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { ContactProps } from '@/db/models/contact'
import type { Column, Table } from '@tanstack/react-table'

import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<ContactProps, any>
  title: string
  table: Table<ContactProps>
}

export function DataTableColumnHeader({
  column,
  title,
  className,
  table,
}: DataTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 size-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 size-4" />
            ) : (
              <ChevronsUpDown className="ml-2 size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(false)
              table.doFilter({ sorting: [{ id: column.id, desc: false }] })
            }}
          >
            <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(true)
              table.doFilter({ sorting: [{ id: column.id, desc: true }] })
            }}
          >
            <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
