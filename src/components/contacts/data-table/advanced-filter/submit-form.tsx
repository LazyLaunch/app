import { actions, isInputError } from 'astro:actions'
import { useForm, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

import type { ContactProps } from '@/db/models/contact'
import type { Table } from '@tanstack/react-table'

interface FormValues {
  projectId: string
  teamId: string
  csrfToken: string
  name: string
  id?: string
}

interface Props {
  filterForm: UseFormReturn<any>
  ids: {
    projectId: string
    teamId: string
  }
  csrfToken: string
  deleteFilterConditionIds: string[]
  table: Table<ContactProps>
}

export function SubmitForm({ deleteFilterConditionIds, csrfToken, table, ids, filterForm }: Props) {
  const { isDirty: isDirtyFilterForm, isValid: isValidFilterForm } = filterForm.formState
  const filterConditions = filterForm.getValues().filterConditions
  const segment = table.getSegment(table.getState().segmentId)
  const form = useForm<FormValues>({
    values: {
      id: segment?.id || '',
      name: segment?.name || '',
      csrfToken,
      ...ids,
    },
  })

  const canSubmit = isDirtyFilterForm || filterConditions?.length === 0 || form.formState.isDirty

  async function handleSubmit(values: FormValues) {
    if (!isValidFilterForm) return filterForm.trigger()
    if (!canSubmit) return
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
        form.setError(key as keyof FormValues, { message })
      }
      return
    }
    table.setFilterConditions(data!.filterConditions)
    table.updateSegments(data!.filter.id, data!.filter)
    table.setSegmentId(data!.filter.id)
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
          <Button type="submit">Save segment</Button>
        </div>
      </form>
    </Form>
  )
}
