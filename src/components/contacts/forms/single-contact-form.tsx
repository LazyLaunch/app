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
import { Switch } from '@/components/ui/switch'

import { CSRF_TOKEN, CustomFieldTypeEnum } from '@/types'
import { isInputError, type SafeResult } from 'astro:actions'

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

interface FormValues {
  [CSRF_TOKEN]: string
  id?: string
  email: string
  firstName: string
  lastName: string
  teamId: string
  projectId: string
  customFields: Record<string, string | boolean | number>
}

export interface OnSubmitSingleContactFormProps {
  values: FormValues
  dirtyFields: Partial<FormValues>
}

interface Props {
  title: string
  desc: string
  btnName?: string
  withDisabledBtn?: boolean
  open: boolean
  setOpen: (open: boolean) => void
  defaultValues: FormValues
  customFields: CustomFieldProps[]
  onSubmit: (
    data: OnSubmitSingleContactFormProps
  ) => Promise<SafeResult<FormValues, boolean> | undefined>
}

export function SingleContactForm({
  open,
  setOpen,
  defaultValues,
  customFields,
  onSubmit,
  title,
  desc,
  btnName = 'Add Contact',
  withDisabledBtn = false,
}: Props) {
  const form = useForm<FormValues>({
    defaultValues,
  })
  const dirtyFields: Partial<FormValues> = form.formState.dirtyFields as Partial<FormValues>

  async function handleSubmit(values: FormValues) {
    const resp = await onSubmit({ values, dirtyFields })
    if (!resp) return

    const { error } = resp

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
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <input
              {...form.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={defaultValues.csrfToken}
            />
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{desc}</DialogDescription>
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
                const { desc, placeholder } = info
                const label = entry.name

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
                            placeholder={placeholder}
                            field={field}
                            label={label}
                            desc={desc}
                          />
                        )
                      }

                      if (entry.type === CustomFieldTypeEnum.BOOLEAN) {
                        return (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">{label}</FormLabel>
                              <FormDescription>{desc}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={[true, 'true', 1, '1'].includes(field.value)}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )
                      }

                      if (entry.type === CustomFieldTypeEnum.NUMBER) {
                        return (
                          <FormItem className="space-y-1">
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={String(field.value ?? '')}
                                type="number"
                                onChange={(e) => {
                                  const targetVal = e.target.value
                                  const value = Number.parseInt(targetVal)
                                  field.onChange(Number.isNaN(value) ? '' : value)
                                }}
                                placeholder={placeholder}
                              />
                            </FormControl>
                            <FormDescription>{desc}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )
                      }

                      return (
                        <FormItem className="space-y-1">
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={String(field.value ?? '')}
                              placeholder={placeholder}
                            />
                          </FormControl>
                          <FormDescription>{desc}</FormDescription>
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
              <Button
                type="submit"
                className="w-full"
                disabled={withDisabledBtn && Object.keys(dirtyFields).length === 0}
              >
                {btnName}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
