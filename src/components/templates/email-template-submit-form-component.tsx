import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useStore } from '@nanostores/react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

import { $emailTemplate, type EmailTemplateProps, type EmojiProps } from '@/stores/template-store'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CSRF_TOKEN } from '@/types'
import { useRef, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'

export enum Action {
  CREATE = 'create',
  UPDATE = 'update',
}

interface FormValues {
  name: string
  description?: string
  emoji: EmojiProps
  [CSRF_TOKEN]: string
  teamId: string
  projectId: string
  emailTemplateId?: string
}

interface EmailTemplateSubmitFormData extends FormValues {
  emailTemplate: Partial<EmailTemplateProps>
  action: Action
  form: UseFormReturn<FormValues>
  handleUrlRedirect: string
}

async function handleSubmit(props: EmailTemplateSubmitFormData) {
  const { emailTemplate, action, emoji, form, handleUrlRedirect } = props

  const formData = new FormData()
  const templateColumns = [
    CSRF_TOKEN,
    'emailTemplateId',
    'teamId',
    'projectId',
    'name',
    'description',
  ]
  const templateObjColumns = ['content', 'settings']

  for (const key of templateColumns) {
    const val = props[key as keyof EmailTemplateSubmitFormData] as string
    val && formData.append(key, val)
  }
  emoji && formData.append('emoji', JSON.stringify(emoji))
  for (const key of templateObjColumns) {
    const val = emailTemplate[key as keyof EmailTemplateProps] as string
    val && formData.append(key, JSON.stringify(val))
  }

  const { error } = await actions.template[action](formData)

  if (isInputError(error)) {
    const { fields } = error

    for (const key of ['name', 'description', 'emoji']) {
      const field = key as keyof Pick<typeof fields, 'name' | 'description' | 'emoji'>
      const message = fields[field]?.[0]
      message && form.setError(field === 'emoji' ? 'name' : field, { message })
    }
    return
  }

  navigate(handleUrlRedirect)
}

function handleClickOutside({
  event,
  isEmoji,
  emojiBtnRef,
  openEmoji,
}: {
  event: PointerEvent
  isEmoji: boolean
  emojiBtnRef: React.RefObject<HTMLButtonElement>
  openEmoji: (isOpen: boolean) => void
}) {
  if (isEmoji && emojiBtnRef.current && !emojiBtnRef.current.contains(event.target as Node)) {
    openEmoji(false)
  }
}

interface Props extends Omit<FormValues, 'emoji'> {
  emoji: EmojiProps
  action: Action
  handleUrlRedirect: string
}

export function EmailTemplateSubmitFormComponent({
  name,
  description,
  emoji,
  csrfToken,
  teamId,
  projectId,
  emailTemplateId,
  action,
  handleUrlRedirect,
}: Props) {
  const emailTemplate = useStore($emailTemplate)
  const [isEmoji, openEmoji] = useState<boolean>(false)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      name,
      description: description || '',
      emoji,
      [CSRF_TOKEN]: csrfToken,
    },
  })

  async function onSubmit(values: FormValues) {
    await handleSubmit({
      ...values,
      action,
      emailTemplate,
      form,
      handleUrlRedirect,
      teamId,
      projectId,
      emailTemplateId,
    })
  }

  if (!emailTemplate.isSubmitForm) return null
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mx-auto mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Finalize Your Email Template</CardTitle>
            <CardDescription>
              Give your email template a unique name with an emoji and add an optional description.
              Once you’re satisfied, click save to complete your template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="relative">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => {
                  return (
                    <>
                      <Button
                        ref={emojiBtnRef}
                        asChild
                        variant="ghost"
                        size="iconSm"
                        className={cn(
                          'absolute left-1 top-9 cursor-pointer',
                          isEmoji && 'bg-accent'
                        )}
                      >
                        <a onClick={() => openEmoji((prevState) => !prevState)}>
                          <span className="text-lg">{field.value.native}</span>
                        </a>
                      </Button>
                      {isEmoji && (
                        <div className="absolute top-20 z-50">
                          <Picker
                            data={data}
                            autoFocus
                            previewPosition="none"
                            emojiSize="20"
                            onEmojiSelect={(emojiProps: EmojiProps) => {
                              form.setValue(field.name, emojiProps)
                              openEmoji(false)
                            }}
                            onClickOutside={(event: PointerEvent) =>
                              handleClickOutside({ event, isEmoji, emojiBtnRef, openEmoji })
                            }
                          />
                        </div>
                      )}
                    </>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: 'Name is required.',
                  maxLength: { value: 50, message: 'The maximum length of the name is 50.' },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn('pl-10')}
                        placeholder="e.g., Welcome Email 🎉"
                        autoFocus
                      />
                    </FormControl>
                    <FormDescription>
                      Give your template a unique name and optionally add an emoji to make it stand
                      out.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              rules={{
                maxLength: { value: 256, message: 'The maximum length of the description is 256.' },
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Template Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="e.g., This template is used for welcoming new users."
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the template's purpose or content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end space-x-2.5">
            <a
              onClick={() => {
                form.reset()
                $emailTemplate.setKey('isSubmitForm', false)
              }}
              className={cn(buttonVariants({ variant: 'secondary' }), 'cursor-pointer')}
            >
              Cancel
            </a>
            <Button type="submit">Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
