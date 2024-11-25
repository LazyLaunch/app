import { actions, isInputError } from 'astro:actions'
import { useForm, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

import type { ContactProps } from '@/db/models/contact'
import type { Table } from '@tanstack/react-table'

interface FormIds {
  csrfToken: string
  projectId: string
  teamId: string
}

interface ExtendedFormValues extends FormIds {
  name: string
  id?: string
}

interface Props {
  filterForm: UseFormReturn<any>
  ids: FormIds
  deleteFilterConditionIds: string[]
  table: Table<ContactProps>
}

export function SubmitForm({ deleteFilterConditionIds, table, ids, filterForm }: Props) {
  const isSubmitFilter = filterForm.formState.isSubmitSuccessful
  const isValid = filterForm.formState.isValid
  const isDirty = filterForm.formState.isDirty

  const segmentId = table.getState().segmentId
  const segment = table.getSegment(segmentId)
  const isInvalidFilters = segment?.id && !isDirty ? false : !isValid || !isSubmitFilter
  const form = useForm<ExtendedFormValues>({
    values: {
      ...ids,
      id: segment?.id || '',
      name: segment?.name || '',
    },
  })

  async function handleSubmit(values: ExtendedFormValues) {
    const filterConditions = filterForm.getValues().filterConditions
    if (isInvalidFilters) return
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('deleteFilterConditionIds', JSON.stringify(deleteFilterConditionIds))
    formData.append('filterConditions', JSON.stringify(filterConditions))

    const { error, data } = await actions.filter.save(formData)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof ExtendedFormValues, { message })
      }
      return
    }
    table.setFilterConditions(data!.filterConditions)
    table.updateSegments(data!.filter.id, data!.filter)
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
            name="name"
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
                        form.setFocus('name')
                        form.resetField('name')
                      }}
                    >
                      Reset
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
