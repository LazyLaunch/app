import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { Info } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Textarea } from '@/components/ui/textarea'

import { CSRF_TOKEN } from '@/constants'

import { validateEmails } from '@/lib/validate-emails'

interface FormValues {
  csrfToken: string
  emails: string
  teamId: string
  projectId: string
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  csrfToken: string
  teamId: string
  projectId: string
}

export function IndividualContactsForm({ open, setOpen, csrfToken, teamId, projectId }: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      emails: '',
      teamId,
      projectId,
    },
  })

  function onClose() {
    form.reset()
    form.clearErrors()
  }

  async function onSubmit(values: FormValues) {
    const result = validateEmails(values.emails)

    if (!result.isValid) {
      return form.setError('emails', {
        type: 'manual',
        message: `One or more email addresses are invalid. Please check and try again.\n ${result.invalidEmails.join(',')}`,
      })
    }

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }

    const { error } = await actions.contact.createBulk(formData)
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
              <DialogTitle>Add Contacts</DialogTitle>
              <DialogDescription>
                Add one or more email addresses for your contacts. You can manage multiple contacts
                at once.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-6">
              <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Any duplicate emails in your submission will be ignored, along with emails that
                  already exist in this project. Only new, unique email addresses will be added to
                  your contact list.
                </AlertDescription>
              </Alert>
              <FormField
                control={form.control}
                name="emails"
                rules={{
                  required: 'Please enter at least one email address.',
                  maxLength: {
                    value: 50000,
                    message: 'Email addresses cannot exceed 50,000 characters.',
                  },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Email Addresses</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="john@example.com, foo@example.com" />
                    </FormControl>
                    <FormDescription>
                      Enter the email addresses, separated by commas. Ensure each one is valid
                      before submitting.
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
                Add contacts
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
