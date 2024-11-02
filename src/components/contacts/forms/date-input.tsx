import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

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

import { cn } from '@/lib/utils'
import { DATE_TEXT_FORMAT } from '@/types'
import { useState } from 'react'

interface Props {
  label: string
  desc: string
  field: any
  placeholder?: string
}

export function DateInput({ field, label, desc, placeholder }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <FormItem className="space-y-1">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  'pl-3 text-left font-normal flex w-full',
                  !field.value && 'text-muted-foreground'
                )}
              >
                {field.value ? format(field.value, DATE_TEXT_FORMAT) : <span>{placeholder}</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              defaultMonth={new Date()}
              captionLayout="buttons"
              mode="single"
              selected={field.value}
              onSelect={(e) => {
                setOpen(false)
                field.onChange(e)
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
