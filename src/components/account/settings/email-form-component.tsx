import { actions, isInputError } from 'astro:actions'

import * as React from 'react'

import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { Resolver } from 'react-hook-form'

import { CSRF_TOKEN, TOAST_ERROR_TIME, TOAST_SUCCESS_TIME } from '@/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { CustomFieldError } from '@/components/card-form'
import { FormErrorMessage } from '@/components/card-form'

interface Props {
  csrfToken: string
  addEmail: (newEmail: string) => void
}

type FormValues = {
  csrfToken: string
  name: string
}

const resolver: Resolver<FormValues> = async (values) => {
  const errors: Record<string, any> = {}

  if (!values.name) {
    errors.name = {
      type: 'required',
      message: 'Email is required.',
    }
  } else if (!/\S+@\S+\.\S+/.test(values.name)) {
    errors.name = {
      type: 'pattern',
      message: 'Email is not valid.',
    }
  }

  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors,
  }
}

export function EmailFormComponent({ csrfToken, addEmail }: Props) {
  const [isLoading, setLoading] = React.useState(false)
  const form = useForm<FormValues>({
    resolver,
    defaultValues: {
      csrfToken,
      name: '',
    },
  })

  const errors: Record<string, CustomFieldError> = form.formState.errors as Record<
    string,
    CustomFieldError
  >
  const isDirty: boolean = form.formState.isDirty

  async function onSubmit(values: FormValues) {
    if (!isDirty) return
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }
    const { error } = await actions.email.create(formData)
    setLoading(false)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof typeof values, { message })
      }

      return toast.error('Email', {
        duration: TOAST_ERROR_TIME,
        description: "Your email address hasn't been created.",
      })
    }

    form.reset()
    addEmail(values.name)
    return toast.info('Email', {
      duration: TOAST_SUCCESS_TIME,
      description: 'Your email address has been created.',
    })
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
        <Card>
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">Add Email</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-normal">
                    Add a new email address to your account. This email, once verified, can be used
                    to login to your account.
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="user@acme.com" />
                  </FormControl>
                  <FormErrorMessage>{errors?.[field.name]?.message}</FormErrorMessage>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-between border-t bg-muted py-3">
            <FormDescription>Please use 32 characters at maximum.</FormDescription>
            <Button disabled={isLoading || !isDirty} type="submit" size="sm">
              {isLoading && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              )}
              {!isLoading && 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
