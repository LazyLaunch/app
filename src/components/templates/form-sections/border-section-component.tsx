import { Plus, Square, Undo2 } from 'lucide-react'

import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { buttonVariants } from '@/components/ui/button'
import { cn, handleKeyDown, handleNumberInput } from '@/lib/utils'

import type { EditorGlobalFormValues } from '@/containers/templates/PlateContainer'
import type { UseFormReturn } from 'react-hook-form'

interface Props {
  form: UseFormReturn<EditorGlobalFormValues>
  className: string
  onReset: (
    values: EditorGlobalFormValues | ((state: EditorGlobalFormValues) => EditorGlobalFormValues)
  ) => void
}

export function BorderSectionComponent({ form, className, onReset }: Props) {
  return (
    <div className={cn('space-y-4', className)}>
      <FormLabel className="flex items-center space-x-2">
        <span>Border</span>
        <a
          onClick={() => {
            form.resetField('borderWidth')
            form.resetField('borderRadius')
            form.resetField('borderColor')
            onReset((prevState) => ({
              ...prevState,
              borderWidth: form.formState.defaultValues?.borderWidth as number,
              borderRadius: form.formState.defaultValues?.borderRadius as number,
              borderColor: form.formState.defaultValues?.borderColor as string,
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
            name="borderWidth"
            rules={{
              max: 10,
              min: 0,
            }}
            render={({ field }) => (
              <FormItem className="relative flex space-y-0">
                <FormControl>
                  <>
                    <Square
                      strokeWidth={parseInt(field.value) || 1}
                      className="absolute left-2.5 top-2.5 size-4"
                    />
                    <Input
                      {...field}
                      className="h-6 w-16 py-4 pl-7 pr-2.5"
                      onChange={(e) =>
                        field.onChange(handleNumberInput(e.target.value, { max: 10 }))
                      }
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
            name="borderRadius"
            rules={{
              max: 20,
              min: 0,
            }}
            render={({ field }) => (
              <FormItem className="relative flex space-y-0">
                <FormControl>
                  <>
                    <div className="absolute left-2.5 top-2.5 size-4 overflow-hidden transition-all duration-300 ease-in-out">
                      <div
                        style={{
                          borderTopLeftRadius: `${field.value}px`,
                        }}
                        className="size-5 border border-foreground transition-colors"
                      ></div>
                    </div>
                    <Input
                      {...field}
                      className="h-6 w-16 py-4 pl-7 pr-2.5"
                      onChange={(e) =>
                        field.onChange(handleNumberInput(e.target.value, { max: 20 }))
                      }
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
          name="borderColor"
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-y-0 rounded-md border border-white px-2 hover:border-input">
              <FormControl>
                <>
                  {field.value === form.formState.defaultValues.borderColor && (
                    <Plus className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                  )}
                  <Input
                    {...field}
                    type="color"
                    id="borderColorInput"
                    value={field.value === 'transparent' ? '#000000' : field.value}
                    className={cn('h-6 w-5 cursor-pointer self-center rounded-none border-0 p-0', {
                      invisible: field.value === form.formState.defaultValues.borderColor,
                    })}
                  />
                </>
              </FormControl>
              <FormLabel
                htmlFor="borderColorInput"
                className={cn('m-0 w-16 cursor-pointer self-center pl-1.5 text-sm', {
                  'text-muted-foreground': field.value === form.formState.defaultValues.borderColor,
                })}
              >
                {field.value === form.formState.defaultValues.borderColor ? 'Color' : field.value}
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
