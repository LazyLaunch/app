import { actions, isInputError } from 'astro:actions'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { CSRF_TOKEN } from '@/types'

import { Button, buttonVariants } from '@/components/ui/button'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export interface ProjectFormResponseData {
  name: string
  slug: string
  teamId: string
}

export interface ProjectFormValues extends ProjectFormResponseData {
  csrfToken: string
}

interface Props {
  csrfToken: string
  setOpenProject: (data: boolean) => void
  addProject: (data: ProjectFormResponseData) => void
  teamId: string
}

export function NewProjectForm({ csrfToken, setOpenProject, addProject, teamId }: Props) {
  const [isLoading, setLoading] = useState<boolean>(false)
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      csrfToken,
      name: '',
      slug: '',
      teamId,
    },
  })

  async function onSubmit(values: ProjectFormValues) {
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const { data, error } = await actions.project.create(formData)

    setLoading(false)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key as keyof ProjectFormValues, { message })
      }
      return
    }

    addProject(data as ProjectFormResponseData)
    form.reset()
    setOpenProject(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
        <input
          {...form.register('teamId', { required: true })}
          type="hidden"
          name="teamId"
          value={teamId}
        />
        <DialogHeader className="mt-0 space-y-6">
          <DialogTitle className="border-b px-6 pb-6 text-2xl font-semibold leading-none tracking-tight">
            Create a project
          </DialogTitle>
          <DialogDescription className="px-6">Let's build something new.</DialogDescription>
        </DialogHeader>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Project name is required.' }}
          render={({ field }) => (
            <FormItem className="space-y-1 px-6">
              <FormLabel className="text-right">Project name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          rules={{ required: 'Project slug is required.' }}
          render={({ field }) => (
            <FormItem className="space-y-1 px-6">
              <FormLabel className="text-right">Project slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border-t p-6">
          <DialogFooter className="flex sm:justify-between">
            <DialogClose>
              <a className={`${buttonVariants({ variant: 'secondary' })}`}>Cancel</a>
            </DialogClose>
            <Button disabled={isLoading} type="submit">
              {isLoading && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              )}
              {!isLoading && 'Create'}
            </Button>
          </DialogFooter>
        </div>
      </form>
    </Form>
  )
}
