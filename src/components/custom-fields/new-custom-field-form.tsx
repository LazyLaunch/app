import { actions, isInputError } from 'astro:actions'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { CSRF_TOKEN, CUSTOM_FIELD_TYPE_LIST, type CustomFieldTypeEnum } from '@/types'
import { navigate } from 'astro:transitions/client'

interface FormValues {
  csrfToken: string
  projectId: string
  teamId: string
  userId: string
  name: string
  type: CustomFieldTypeEnum | string
}

interface Props {
  csrfToken: string
  ids: {
    projectId: string
    teamId: string
  }
}

export function NewCustomFieldForm({ csrfToken, ids }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      ...ids,
      name: '',
      type: '',
    },
  })

  function onClose() {
    form.reset()
    form.clearErrors()
  }

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const { error } = await actions.customField.create(formData)

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
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add field
        </Button>
      </DialogTrigger>
      <DialogContent onCloseAutoFocus={onClose} className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <input
              {...form.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={csrfToken}
            />
            <DialogHeader>
              <DialogTitle>Add Custom Field to Contact</DialogTitle>
              <DialogDescription>
                Create a new custom field to store additional information about your contacts. You
                can specify a field name and choose the data type that best fits your needs.
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
                      <Input
                        {...field}
                        placeholder="Enter the field name (e.g., Birthday, Address)"
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a unique name for this field that describes the kind of information it
                      will store.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                rules={{
                  required: 'Type is required.',
                  validate: (val) => CUSTOM_FIELD_TYPE_LIST.includes(val as CustomFieldTypeEnum),
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Field Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a data type (e.g., String, Boolean)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUSTOM_FIELD_TYPE_LIST.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the type of data this field will hold. This ensures the correct format
                      is used for storing and displaying the information.
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
                Add field
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
