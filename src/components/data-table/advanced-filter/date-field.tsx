import { UTCDate } from '@date-fns/utc'
import { format, getTime } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import { DATE_TEXT_FORMAT } from '@/constants'
import { CustomFieldTypeEnum, Operator } from '@/enums'

function DatePicker({
  field,
  className,
  placeholder,
}: { field: any; className: string; placeholder: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'pl-3 text-left font-normal flex w-full space-x-2 justify-between',
            !field.value && 'text-muted-foreground',
            className
          )}
        >
          {field.value ? (
            <span>{format(new UTCDate(field.value), DATE_TEXT_FORMAT)}</span>
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
          selected={field.value ? new UTCDate(field.value) : undefined}
          onSelect={(date) => {
            setOpen(false)
            const value = date && getTime(new UTCDate(date))
            field.onChange({ target: { value } })
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
  const isBetweenOperator = Number(watchOperator) === Operator.BETWEEN
  const label = isBetweenOperator ? 'Select start date...' : placeholder
  const showInputs =
    isDateType &&
    [Operator.IS_AFTER, Operator.IS_BEFORE, Operator.BETWEEN].includes(Number(watchOperator))
  const error = (errors.filterConditions as any)?.[index]

  useEffect(() => {
    return () => {
      form.unregister(name)
      form.unregister(secondaryName)
    }
  }, [form, name, secondaryName])

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
