import { UTCDate } from '@date-fns/utc'
import type { Column, Table } from '@tanstack/react-table'
import { endOfDay, format, startOfDay } from 'date-fns'
import { CalendarIcon, Check, CirclePlus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { DATE_TEXT_FORMAT } from '@/constants'
import type { ContactProps } from '@/db/models/contact'
import { CustomFieldTypeEnum } from '@/enums'
import { cn } from '@/lib/utils'

import { updateOrInsert } from '@/lib/update-or-insert'
import type { DateRange } from 'react-day-picker'

interface DataTableFacetedFilterProps {
  column?: Column<ContactProps, any>
  title?: string
  withSearchCommand?: boolean
  type: CustomFieldTypeEnum
  options?: {
    label: string
    value: string | boolean
    icon?: React.ComponentType<{ className?: string }>
  }[]
  className?: string
  table: Table<ContactProps>
}

function CalendarFacet({
  title,
  className,
  column,
  table,
}: Pick<DataTableFacetedFilterProps, 'title' | 'className' | 'column' | 'table'>) {
  const selectedDateFilter = new Map<'to' | 'from', number | undefined>(
    column?.getFilterValue() as Iterable<['from' | 'to', number | undefined]>
  )
  const fromDate = selectedDateFilter.get('from')
  const toDate = selectedDateFilter.get('to')
  const dateStart = fromDate && startOfDay(new UTCDate(fromDate))
  const dateEnd = toDate && endOfDay(new UTCDate(toDate))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 border-dashed', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {title}
          {(dateStart || dateEnd) && <Separator orientation="vertical" className="mx-2 h-4" />}
          <div className="hidden space-x-1 lg:flex">
            {dateStart && (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {format(dateStart, DATE_TEXT_FORMAT)}
              </Badge>
            )}
            {dateEnd && (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {format(dateEnd, DATE_TEXT_FORMAT)}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={new UTCDate().getFullYear()}
          mode="range"
          defaultMonth={new UTCDate()}
          selected={{ from: dateStart, to: dateEnd } as DateRange}
          onSelect={(date) => {
            if (date) {
              selectedDateFilter.set('from', date.from && new UTCDate(date.from).getTime())
              selectedDateFilter.set('to', date.to && new UTCDate(date.to).getTime())
            } else {
              selectedDateFilter.set('from', undefined)
              selectedDateFilter.set('to', undefined)
            }
            const value = Array.from(selectedDateFilter)
            column?.setFilterValue(value)
            const values = updateOrInsert(
              table.getState().columnFilters as any[],
              column!.id,
              value
            )
            table.doFilter({
              columnFilters: value.length ? values : [],
            })
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

function DefaultFacet({
  column,
  title,
  options = [],
  withSearchCommand = false,
  className,
  table,
}: Omit<DataTableFacetedFilterProps, 'type'>) {
  const selectedValues = new Set<string | boolean>(column?.getFilterValue() as string[] | boolean[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 border-dashed', className)}>
          <CirclePlus className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option, index) => (
                      <Badge
                        variant="secondary"
                        key={`${option.value}-${index}`}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Command>
          {withSearchCommand && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={`${option.value}-${index}`}
                    className="cursor-pointer pr-10"
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(filterValues.length ? filterValues : undefined)
                      const values = updateOrInsert(
                        table.getState().columnFilters as any[],
                        column!.id,
                        filterValues
                      )
                      table.doFilter({
                        columnFilters: filterValues.length ? values : [],
                      })
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className={cn('h-4 w-4')} />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      column?.setFilterValue(undefined)
                      const values = updateOrInsert(
                        table.getState().columnFilters as any[],
                        column!.id,
                        undefined
                      )
                      table.doFilter({ columnFilters: values })
                    }}
                    className="cursor-pointer justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function DataTableFacetedFilter({ type, ...rest }: DataTableFacetedFilterProps) {
  if (type === CustomFieldTypeEnum.DATE) {
    return <CalendarFacet {...rest} />
  }

  return <DefaultFacet {...rest} />
}
