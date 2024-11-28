import { useRef } from 'react'

import { Check, ChevronsUpDown, Settings2 } from 'lucide-react'

import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn, formatCamelCaseToTitle } from '@/lib/utils'

import type { ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

interface DataTableViewOptionsProps {
  table: Table<ContactProps>
  className?: string
  customFields: CustomFieldProps[]
}

export function DataTableViewOptions({
  table,
  className,
  customFields,
}: DataTableViewOptionsProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())

  const customFieldIds = customFields.map((c) => c.id)
  const contactColumns = columns.filter((column) => !customFieldIds.includes(column.id))
  const customColumns = columns.filter((column) => customFieldIds.includes(column.id))

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          aria-label="Toggle columns"
          variant="outline"
          size="sm"
          className={cn(
            'ml-auto hidden h-8 gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0 lg:flex',
            className
          )}
        >
          <Settings2 className="size-4" />
          View
          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup heading="Contact columns">
              {contactColumns.map((column) => {
                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => {
                      column.toggleVisibility(!column.getIsVisible())
                    }}
                  >
                    <span className="truncate">{formatCamelCaseToTitle(column.id)}</span>
                    <Check
                      className={cn(
                        'ml-auto size-4 shrink-0',
                        column.getIsVisible() ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandGroup heading="Custom columns">
              {customColumns.map((column) => {
                const field = customFields.find((f) => f.id === column.id)
                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => {
                      column.toggleVisibility(!column.getIsVisible())
                    }}
                  >
                    <span className="truncate">{field!.name}</span>
                    <Check
                      className={cn(
                        'ml-auto size-4 shrink-0',
                        column.getIsVisible() ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
