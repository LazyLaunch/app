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

import type { CustomFieldList } from '@/db/models/custom-field'
import { CSRF_TOKEN } from '@/types'
import type { Row } from '@tanstack/react-table'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

interface RowActionsProps {
  row: Row<CustomFieldList>
  [CSRF_TOKEN]: string
  projectId: string
}

interface FormValues {
  id: string
  [CSRF_TOKEN]: string
  name: string
  projectId: string
}

export function EditCustomFieldForm({ csrfToken, row, projectId }: RowActionsProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      name: row.original.name,
      id: row.original.id,
      projectId,
    },
  })

  async function onSubmit(values: FormValues) {
    if (!form.formState.isDirty) return

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const { error } = await actions.customField.update(formData)

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
          <DialogTitle>Update Custom Field Name</DialogTitle>
          <DialogDescription>
            Modify the name of your custom field to ensure it accurately reflects its purpose. This
            update will only affect the field’s display name.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-6">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: 'Name is required.',
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters.',
              },
            }}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Field Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter the field name (e.g., Birthday, Address)" />
                </FormControl>
                <FormDescription>
                  Choose a unique name for this field that describes the kind of information it will
                  store.
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
          <Button disabled={!form.formState.isDirty} type="submit" className="w-full">
            Update
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
