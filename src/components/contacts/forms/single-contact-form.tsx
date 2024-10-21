import { actions, isInputError } from 'astro:actions'
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

import { CSRF_TOKEN } from '@/types'

interface FormValues {
  [CSRF_TOKEN]: string
  email: string
  firstName: string
  lastName: string
  teamId: string
  projectId: string
}

interface Props extends Pick<FormValues, 'teamId' | 'projectId' | 'csrfToken'> {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SingleContactForm({ open, setOpen, csrfToken, ...rest }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      csrfToken,
      ...rest,
    },
  })

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
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
    // form.reset()
    // setOpen(false)
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
