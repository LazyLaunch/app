import { UTCDate } from '@date-fns/utc'
import { format, getTime } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import { DATE_TEXT_FORMAT } from '@/constants'
import { CustomFieldTypeEnum, OperatorEnum } from '@/enums'

function DatePicker({
  field,
  className,
  placeholder,
}: { field: any; className: string; placeholder: string }) {
  const [open, setOpen] = useState(false)
  const isValidValue = !Number.isNaN(Number.parseInt(field.value))
  const value = isValidValue ? Number.parseInt(field.value) : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'pl-3 text-left font-normal flex w-full space-x-2 justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value ? (
            <span>{format(new UTCDate(value), DATE_TEXT_FORMAT)}</span>
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          defaultMonth={new UTCDate()}
          captionLayout="buttons"
          mode="single"
          selected={value ? new UTCDate(value) : undefined}
          onSelect={(date) => {
            setOpen(false)
            const _value = date && getTime(new UTCDate(date))
            field.onChange({ target: { value: _value } })
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateField({
  form,
  type,
  index,
  className,
  placeholder,
}: {
  form: UseFormReturn<any>
  className?: string
  placeholder: string
  type?: string
  index: number
}) {
  const name = `filterConditions.${index}.value`
  const secondaryName = `filterConditions.${index}.secondaryValue`
  const watchOperator = form.watch(`filterConditions.${index}.operator`)
  const errors = form.formState.errors

  const isDateType = type === CustomFieldTypeEnum.DATE
  const isBetweenOperator = Number(watchOperator) === OperatorEnum.BETWEEN
  const label = isBetweenOperator ? 'Select start date...' : placeholder
  const showInputs =
    isDateType &&
    [OperatorEnum.IS_AFTER, OperatorEnum.IS_BEFORE, OperatorEnum.BETWEEN].includes(
      Number(watchOperator)
    )
  const error = (errors.filterConditions as any)?.[index]

  if (showInputs)
    return (
      <div className={className}>
        <Controller
          control={form.control}
          name={name}
          rules={{
            required: showInputs,
          }}
          shouldUnregister
          render={({ field }) => (
            <DatePicker
              className={cn(error?.value && 'border-destructive')}
              field={field}
              placeholder={label}
            />
          )}
        />
        {isBetweenOperator && (
          <Controller
            control={form.control}
            name={secondaryName}
            rules={{
              required: isBetweenOperator,
            }}
            shouldUnregister
            render={({ field }) => (
              <DatePicker
                className={cn(error?.secondaryValue && 'border-destructive')}
                field={field}
                placeholder="Select end date..."
              />
            )}
          />
        )}
      </div>
    )

  return (
    isDateType && (
      <div className={className}>
        <div
          aria-label="Date filter is empty"
          className="h-full w-full rounded border border-dashed"
        />
      </div>
    )
  )
}
