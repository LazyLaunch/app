import { UTCDate } from '@date-fns/utc'
import { format, getTime } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { DATE_TEXT_FORMAT } from '@/constants'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  label?: string
  desc?: string
  field: any
  placeholder?: string
}

export function DateInput({ className, field, label, desc, placeholder }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <FormItem className={cn('space-y-1', className)}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  'pl-3 text-left font-normal flex w-full space-x-2 justify-between',
                  !field.value && 'text-muted-foreground'
                )}
              >
                {field.value ? (
                  <span>{format(new UTCDate(field.value), DATE_TEXT_FORMAT)}</span>
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto size-4 opacity-50" />
              </Button>
            </FormControl>
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
                field.onChange(value)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormDescription>{desc}</FormDescription>
      <FormMessage />
    </FormItem>
  )
}
