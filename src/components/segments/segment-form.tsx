import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { CSRF_TOKEN } from '@/constants'

import type { SelectFilter } from '@/db/schema'
import type { Row } from '@tanstack/react-table'

interface FormValues {
  csrfToken: string
  projectId: string
  teamId: string
  id?: string
  name: string
}

interface Props {
  csrfToken: string
  row?: Row<SelectFilter>
  ids: {
    projectId: string
    teamId: string
  }
}

export function SegmentForm({ csrfToken, ids, row }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      ...ids,
      id: row?.original.id || '',
      name: row?.original.name || '',
    },
  })

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('deleteFilterConditionIds', JSON.stringify([]))
    formData.append('filterConditions', JSON.stringify([]))

    const { error } = await actions.filter.save(formData)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof FormValues, { message })
      }
      return
    }

    navigate(window.location.pathname)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
        <DialogHeader>
          <DialogTitle>{row?.original.id ? 'Edit' : 'Create New'} Segment</DialogTitle>
          <DialogDescription>
            Group your advanced filters into a segment for easy access and reuse. Save time by
            quickly applying your most-used filters.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-6">
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
              <FormItem className="space-y-1">
                <FormLabel>Segment Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter a name for this segment (e.g., VIP Customers, Recent Signups)"
                  />
                </FormControl>
                <FormDescription>
                  Choose a clear and descriptive name for this segment to easily identify it later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" className="w-full">
            Save Segment
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
