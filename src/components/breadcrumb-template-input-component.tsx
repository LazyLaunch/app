import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useStore } from '@nanostores/react'
import { actions } from 'astro:actions'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { CSRF_TOKEN, TOAST_SUCCESS_TIME } from '@/types'

import { $emailTemplate, type EmojiProps } from '@/stores/template-store'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface FormValues {
  csrfToken: string
  name: string
  emoji: EmojiProps
}

interface Props {
  name: string
  csrfToken: string
  emoji: string
  emailTemplateId?: string
  teamId: string
  projectId: string
  isHandleSubmit?: boolean
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

export function BreadcumbTemplateInputComponent({
  name,
  csrfToken,
  emoji,
  emailTemplateId,
  teamId,
  projectId,
  isHandleSubmit = false,
}: Props) {
  const emailTemplate = useStore($emailTemplate)
  const [isEmoji, openEmoji] = useState(false)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      [CSRF_TOKEN]: csrfToken,
      name: name,
      emoji: JSON.parse(emoji),
    },
  })
  const isDirty: boolean = form.formState.isDirty

  async function onSubmit(values: FormValues) {
    form.reset(values, { keepDirty: false })
    $emailTemplate.setKey('name', values.name)
    $emailTemplate.setKey('emoji', values.emoji)

    if (isHandleSubmit && emailTemplateId) {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('description', emailTemplate.description || '')
      formData.append(CSRF_TOKEN, values[CSRF_TOKEN])
      formData.append('emailTemplateId', emailTemplateId)
      formData.append('teamId', teamId)
      formData.append('projectId', projectId)
      formData.append('emoji', JSON.stringify(values.emoji))
      formData.append('content', JSON.stringify(emailTemplate.content))
      formData.append('settings', JSON.stringify(emailTemplate.settings))

      const { data, error } = await actions.template.update(formData)

      toast.info('Email Template Updated', {
        duration: TOAST_SUCCESS_TIME,
        description: 'The email template info has been successfully updated.',
      })
    }
  }

  return (
    <Form {...form}>
      <form className="group flex" onSubmit={form.handleSubmit(onSubmit)}>
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
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
                    className={cn('absolute left-1 top-1 cursor-pointer', isEmoji && 'bg-accent')}
                  >
                    <a onClick={() => openEmoji((prevState) => !prevState)}>
                      <span className="text-lg">{field.value.native}</span>
                    </a>
                  </Button>
                  {isEmoji && (
                    <div className="absolute top-11 z-50">
                      <Picker
                        data={data}
                        autoFocus
                        previewPosition="none"
                        emojiSize="20"
                        onEmojiSelect={(emojiProps: EmojiProps) => {
                          form.setValue(field.name, emojiProps)
                          onSubmit(form.getValues())
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
            rules={{ required: 'Name is required.' }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onBlur={() => {
                      isDirty && onSubmit(form.getValues())
                    }}
                    className={cn(
                      'h-10 w-96 items-center self-center border-transparent bg-inherit pl-10 pr-20 pt-1.5 text-sm placeholder:text-muted-foreground focus-visible:bg-background focus-visible:outline-none group-hover:border-input',
                      isEmoji && 'border-input'
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
