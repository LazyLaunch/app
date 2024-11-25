import { actions } from 'astro:actions'
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

import { CSRF_TOKEN, DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constants'

interface Props {
  table: Table<ContactProps>
  setSegmentId: (id: string) => void
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

export function SegmentForm({ table, ids, csrfToken, setSegmentId }: Props) {
  const filterId = table.getState().segmentId
  const form = useForm<FormValues>({
    values: {
      csrfToken,
      filterId,
      ...ids,
    },
  })

  async function handleSubmit(values: FormValues) {
    setSegmentId(values.filterId)
    table.setSegmentId(values.filterId)
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const { data } = await actions.filter.contactsByFilterId(formData)
    table.setFilterConditions(data?.filterConditions || [])
    table.options.meta!.onApplyAdvancedFilter?.(data!.contacts as ContactProps[])
    table.options.meta!.setTotal?.(data!.contactsTotal as number)

    table.setColumnFilters([])
    table.setGlobalFilter([])
    table.setSorting([{ id: 'createdAt', desc: true }])
    table.setPagination({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    })
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
                defaultValue={filterId}
                name={field.name}
                value={field.value}
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
