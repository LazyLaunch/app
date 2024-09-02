import { actions, isInputError } from 'astro:actions'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { CSRF_TOKEN } from '@/types'

import { Button, buttonVariants } from '@/components/ui/button'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'

export interface FormResponseData {
  name: string
  slug: string
  userId: string
}

export interface FormValues {
  csrfToken: string
  teamName: string
  address: string
}

interface Props {
  csrfToken: string
  className: string
  addTeam: (data: FormResponseData) => void
}

export function AddTeamBtnComponent({ csrfToken, className, addTeam }: Props) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setLoading] = React.useState(false)
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      address: '',
      teamName: '',
    },
  })
  const errors = form.formState.errors

  async function onSubmit(values: FormValues) {
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const { data, error } = await actions.team.create(formData)
    setLoading(false)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof FormValues, { message })
      }
      return
    }

    addTeam(data as FormResponseData)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={className}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create a Team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input
              {...form.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={csrfToken}
            />
            <DialogHeader className="mt-0 space-y-6">
              <DialogTitle className="border-b px-6 pb-6 text-2xl font-semibold leading-none tracking-tight">
                Create a team
              </DialogTitle>
              <DialogDescription className="px-6">
                Continue to start collaborating on Pro with increased usage, additional security
                features, and support.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="teamName"
              rules={{ required: 'Team name is required.' }}
              render={({ field }) => (
                <FormItem className="space-y-1 px-6">
                  <FormLabel className="text-right">Team name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              rules={{ required: 'Address is required.' }}
              render={({ field }) => (
                <FormItem className="space-y-1 px-6">
                  <FormLabel className="text-right">Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="px-6 text-sm font-normal text-muted-foreground">
              Continuing will start a monthly Pro plan subscription. Learn More
            </p>
            <div className="border-t p-6">
              <DialogFooter className="flex sm:justify-between">
                <DialogClose asChild>
                  <a className={`${buttonVariants({ variant: 'secondary' })}`}>Cancel</a>
                </DialogClose>
                <Button disabled={isLoading} type="submit">
                  {isLoading && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  )}
                  {!isLoading && 'Continue'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
