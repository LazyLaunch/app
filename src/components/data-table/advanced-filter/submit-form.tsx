import { actions, isInputError } from 'astro:actions'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import type { FilterCondition } from '@/db/models/filter'
import type { CustomFieldTypeEnum } from '@/enums'

interface FormValues {
  csrfToken: string
  projectId: string
  teamId: string
  filterConditions: (Omit<FilterCondition, 'operator'> & {
    columnType?: CustomFieldTypeEnum
    operator?: number | undefined
  })[]
}

interface ExtendedFormValues extends FormValues {
  filterName: string
}

interface Props {
  defaultValues: FormValues
  isValid: boolean
  isSubmitFilter: boolean
}

export function SubmitForm({ defaultValues, isValid, isSubmitFilter }: Props) {
  const isInvalidFilters = !isValid || !isSubmitFilter
  const form = useForm<ExtendedFormValues>({
    defaultValues: {
      ...defaultValues,
      filterName: '',
    },
  })

  useEffect(() => {
    form.reset({ ...defaultValues, filterName: form.getValues().filterName })
  }, [defaultValues, form.reset, form.getValues])

  async function handleSubmit({ filterConditions, ...values }: ExtendedFormValues) {
    if (isInvalidFilters) return
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('filterConditions', JSON.stringify(filterConditions))

    const { error, data } = await actions.filter.save(formData)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof FormValues, { message })
      }
      return
    }
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-foreground">Save Filter as Segment</h2>
          <p className="text-sm text-muted-foreground">
            Save your current filter settings as a reusable segment. You can load this segment later
            to quickly apply the same filters.
          </p>
        </div>
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="filterName"
            rules={{
              required: 'Segment name cannot be empty. Please provide a name to save the filter.',
              maxLength: {
                value: 25,
                message: 'Segment name cannot exceed 25 characters. Please use a shorter name.',
              },
            }}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex relative w-full">
                    <Input
                      {...field}
                      placeholder="Enter a name for this segment (e.g., VIP Customers, Recent Signups)"
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-0.5 rounded-l-none absolute right-0"
                      onClick={() => {
                        form.setFocus('filterName')
                        form.resetField('filterName')
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isInvalidFilters}>
            Save segment
          </Button>
        </div>
      </form>
    </Form>
  )
}
