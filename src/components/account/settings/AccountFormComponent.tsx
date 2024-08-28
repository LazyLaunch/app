import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { Resolver } from 'react-hook-form'

import { ResponseStatus, CSRF_TOKEN } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

import type { SelectUser } from '@/db/schema'

interface Props {
  user: Partial<SelectUser>
  csrfToken: string
}

type FormValues = {
  name: string
  username: string
  email: string
  csrfToken: string
}

const resolver: Resolver<FormValues> = async (values) => {
  const errors: Record<string, any> = {}

  if (!values.name) {
    errors.name = {
      type: 'required',
      message: 'Name is required.',
    }
  }

  if (!values.username) {
    errors.username = {
      type: 'required',
      message: 'Username is required.',
    }
  }

  if (!values.email) {
    errors.email = {
      type: 'required',
      message: 'Email is required.',
    }
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = {
      type: 'pattern',
      message: 'Email is not valid.',
    }
  }

  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors,
  }
}

export function AccountFormComponent({ user, csrfToken }: Props) {
  const form = useForm<FormValues>({
    resolver,
    defaultValues: {
      name: user.name,
      username: '',
      email: user.email,
      csrfToken: csrfToken,
    },
  })

  async function onSubmit(values: object) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }
    const response = await fetch('/account/update', {
      method: 'PUT',
      body: formData,
    })
    const data = await response.json()
    if (data.status === ResponseStatus.Success) {
      return toast.info('Account Settings', {
        duration: 5000,
        description: 'Your informations have been updated.',
      })
    }

    toast.error('Account Settings', {
      duration: 5000,
      description: "Your informations haven't been updated.",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This is your URL namespace within the site.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={user.email}>
                    {user.email}
                    <Badge className="ml-2">Primary</Badge>
                    <Badge className="ml-2">Verified</Badge>
                  </SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage email addresses in your{' '}
                <a href="/examples/forms" className="underline">
                  email settings
                </a>
                .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
