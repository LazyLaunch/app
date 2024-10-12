import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Plus, Undo2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { buttonVariants } from '@/components/ui/button'
import { cn, handleKeyDown, handleNumberInput } from '@/lib/utils'

import type { EmailTemplateSettings } from '@/stores/template-store'
import { DEFAULT_SETTINGS } from '@/stores/template-store'

interface Props {
  form: UseFormReturn<EmailTemplateSettings>
  className: string
  onReset: (values: (state: EmailTemplateSettings) => EmailTemplateSettings) => void
}

export function BackgroundSectionComponent({ form, className, onReset }: Props) {
  const defaultValues = form.formState.defaultValues!
  const { bgHPadding, bgVPadding, bgColor } = DEFAULT_SETTINGS

  return (
    <div className={cn('space-y-4', className)}>
      <FormLabel className="flex items-center space-x-2">
        <span>Background</span>
        <a
          onClick={() => {
            onReset((prevState) => ({
              ...prevState,
              bgHPadding,
              bgVPadding,
              bgColor,
            }))
          }}
          className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'cursor-pointer p-2')}
        >
          <Undo2 className="size-3" />
        </a>
      </FormLabel>
      <div className="flex w-full justify-between">
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="bgHPadding"
            rules={{
              max: 100,
              min: 0,
            }}
            render={({ field }) => (
              <FormItem className="relative flex space-y-0">
                <FormControl>
                  <>
                    <AlignHorizontalSpaceAround className="absolute left-2.5 top-2.5 size-4" />
                    <Input
                      {...field}
                      className="h-6 w-16 py-4 pl-7 pr-2.5"
                      onChange={(e) => field.onChange(handleNumberInput(e.target.value))}
                      value={`${field.value}`}
                      onKeyDown={handleKeyDown}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bgVPadding"
            rules={{
              max: 100,
              min: 0,
            }}
            render={({ field }) => (
              <FormItem className="relative flex space-y-0">
                <FormControl>
                  <>
                    <AlignVerticalSpaceAround className="absolute left-2.5 top-2.5 size-4" />
                    <Input
                      {...field}
                      className="h-6 w-16 py-4 pl-7 pr-2.5"
                      onChange={(e) => field.onChange(handleNumberInput(e.target.value))}
                      value={`${field.value}`}
                      onKeyDown={handleKeyDown}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bgColor"
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-y-0 rounded-md border border-white px-2 hover:border-input">
              <FormControl>
                <>
                  {field.value === defaultValues.bgColor && (
                    <Plus className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                  )}
                  <Input
                    {...field}
                    type="color"
                    id="bgColorInput"
                    value={field.value === 'transparent' ? '#000000' : field.value}
                    className={cn('h-6 w-5 cursor-pointer self-center rounded-none border-0 p-0', {
                      invisible: field.value === defaultValues.bgColor,
                    })}
                  />
                </>
              </FormControl>
              <FormLabel
                htmlFor="bgColorInput"
                className={cn('m-0 w-16 cursor-pointer self-center pl-1.5 text-sm', {
                  'text-muted-foreground': field.value === defaultValues.bgColor,
                })}
              >
                {field.value === defaultValues.bgColor ? 'Color' : field.value}
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
