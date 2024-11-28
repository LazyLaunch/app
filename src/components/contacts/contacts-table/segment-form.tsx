import { ListFilter } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Form, FormField } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { ContactProps } from '@/db/models/contact'
import type { Table } from '@tanstack/react-table'

import { CSRF_TOKEN } from '@/constants'
import { actions } from 'astro:actions'

interface Props {
  table: Table<ContactProps>
  csrfToken: string
  ids: {
    projectId: string
    teamId: string
  }
}

interface FormValues {
  csrfToken: string
  filterId: string
  projectId: string
  teamId: string
}

export function SegmentForm({ table, ids, csrfToken }: Props) {
  const filterId = table.getState().segmentId
  const form = useForm<FormValues>({
    values: {
      csrfToken,
      filterId,
      ...ids,
    },
  })

  async function handleSubmit(values: FormValues) {
    table.setSegmentId(values.filterId)

    const { customColumnIds, pagination, sorting } = table.getState()
    const formData = new FormData()
    for (const [key, value] of Object.entries({
      ...values,
      ...pagination,
    })) {
      formData.append(key, value?.toString() || '')
    }
    formData.append(
      'sorting',
      JSON.stringify(sorting.filter((c) => !customColumnIds.includes(c.id)))
    )
    formData.append(
      'customFieldsSorting',
      JSON.stringify(sorting.filter((c) => customColumnIds.includes(c.id)))
    )

    const { data } = await actions.filter.contactsByFilterId(formData)
    table.options.meta!.onApplyAdvancedFilter?.(data!.contacts as ContactProps[])
    table.options.meta!.setTotal?.(data!.contactsTotal as number)
    table.setFilterConditions(data!.filterConditions)
    table.setColumnFilters([])
    table.setGlobalFilter([])
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)}>
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
        <FormField
          control={form.control}
          name="filterId"
          render={({ field }) => {
            const selectedName = table.getSegment(field.value)?.name
            return (
              <Select
                defaultValue={selectedName ? field.value : ''}
                name={field.name}
                value={selectedName ? field.value : ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="h-8 w-auto gap-2 hover:bg-accent hover:text-accent-foreground font-medium">
                  <ListFilter className="size-4" />
                  <SelectValue aria-label={selectedName} placeholder="Segments">
                    {selectedName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {table.getState().segments.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )
          }}
        />
      </form>
    </Form>
  )
}
