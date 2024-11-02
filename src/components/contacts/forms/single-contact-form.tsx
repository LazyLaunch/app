import { navigate } from 'astro:transitions/client'
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

import { CSRF_TOKEN, CustomFieldTypeEnum } from '@/types'
import { actions, isInputError } from 'astro:actions'

import { DateInput } from '@/components/contacts/forms/date-input'
import type { CustomFieldProps } from '@/db/models/custom-field'

function fieldInfo(
  fieldName: string,
  type: CustomFieldTypeEnum
): { desc: string; placeholder?: string | undefined } {
  const info: Record<CustomFieldTypeEnum, { desc: string; placeholder?: string | undefined }> = {
    [CustomFieldTypeEnum.STRING]: {
      desc: `This field allows you to enter information specific to this contact, such as their ${fieldName.toLowerCase()}`,
      // desc: `Enter detailed information for ${fieldName.toLowerCase()} in text form.`,
      placeholder: 'Enter a text...',
    },
    [CustomFieldTypeEnum.NUMBER]: {
      desc: `Provide a numerical value that represents ${fieldName.toLowerCase()}.`,
      placeholder: 'Enter a number...',
    },
    [CustomFieldTypeEnum.BOOLEAN]: {
      desc: `Indicate a true or false value for ${fieldName.toLowerCase()}.`,
      placeholder: undefined,
    },
    [CustomFieldTypeEnum.DATE]: {
      desc: `Choose a date that reflects the intended ${fieldName.toLowerCase()} context.`,
      placeholder: 'Choose a date...',
    },
  } as Record<CustomFieldTypeEnum, { desc: string; placeholder?: string | undefined }>

  return info[type]
}

function getFields(data: CustomFieldProps[]): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const field of data) {
    fields[field.id] = ''
  }

  return fields
}

interface FormValues {
  [CSRF_TOKEN]: string
  email: string
  firstName: string
  lastName: string
  teamId: string
  projectId: string
  customFields: Record<string, string>
}

interface Props extends Pick<FormValues, 'teamId' | 'projectId' | 'csrfToken'> {
  open: boolean
  setOpen: (open: boolean) => void
  customFields: CustomFieldProps[]
}

export function SingleContactForm({ open, setOpen, csrfToken, customFields, ...rest }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      csrfToken,
      customFields: getFields(customFields),
      ...rest,
    },
  })

  async function onSubmit({ customFields, ...values }: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('customFields', JSON.stringify(customFields))
    const { error } = await actions.contact.create(formData)

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

  function onClose() {
    form.reset()
    form.clearErrors()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <DialogTitle>Add Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your subscriber list for email notifications. Please provide
                the contact's information.
              </DialogDescription>
            </DialogHeader>
            <div className="my-6 space-y-6">
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email address is required.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address.',
                  },
                  maxLength: {
                    value: 256,
                    message: 'Email address cannot exceed 256 characters.',
                  },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="john@example.com" />
                    </FormControl>
                    <FormDescription>
                      Enter the contact's email address. This will be used for sending email
                      notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                rules={{
                  maxLength: { value: 256, message: 'First name cannot exceed 256 characters.' },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormDescription>The first name of the contact.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                rules={{
                  maxLength: { value: 256, message: 'Last name cannot exceed 256 characters.' },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormDescription>The last name of the contact.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {customFields.map((entry) => {
                const info = fieldInfo(entry.name, entry.type)
                return (
                  <FormField
                    key={entry.id}
                    control={form.control}
                    name={`customFields.${entry.id}`}
                    rules={{
                      maxLength: { value: 256, message: 'Last name cannot exceed 256 characters.' },
                    }}
                    render={({ field }) => {
                      if (entry.type === CustomFieldTypeEnum.DATE) {
                        return (
                          <DateInput
                            placeholder={info.placeholder}
                            field={field}
                            label={entry.name}
                            desc={info.desc}
                          />
                        )
                      }

                      return (
                        <FormItem className="space-y-1">
                          <FormLabel>{entry.name}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={info.placeholder} />
                          </FormControl>
                          <FormDescription>{info.desc}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                )
              })}
            </div>
            <DialogFooter className="space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="w-full">
                Add contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
