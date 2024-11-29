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

export function GroupForm({ csrfToken, ids, row }: Props) {
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
    const { error } = await actions.group.save(formData)
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
          <DialogTitle>{row?.original.id ? 'Edit' : 'Create New'} Group</DialogTitle>
          <DialogDescription>
            Organize your contacts by creating a group. You can easily manage and filter contacts
            within this group.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-6">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: 'Group name cannot be empty. Please provide a name to save the group.',
              maxLength: {
                value: 25,
                message: 'Group name cannot exceed 25 characters. Please use a shorter name.',
              },
            }}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter a name for this group (e.g., Premium Members)"
                  />
                </FormControl>
                <FormDescription>
                  Give your group a clear and descriptive name to help identify its purpose.
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
            Save Group
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
