import { actions } from 'astro:actions'

import { cn } from '@/lib/utils'
import { MoreHorizontal } from 'lucide-react'

import { CSRF_TOKEN } from '@/types'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EmailProps } from '@/containers/emails/email-settings-container'

type FormValues = {
  csrfToken: string
  email: string
}

type SetAsPrimaryForm = FormValues & {
  isVerified: string
}

interface Props {
  csrfToken: string
  deleteEmail: (email: string) => void
  setPrimaryEmail: (email: string) => void
  email: EmailProps
}

export function EmailRowComponent({ csrfToken, deleteEmail, email, setPrimaryEmail }: Props) {
  const isPrimary = Boolean(email.primary)
  const isVerified = Boolean(email.verified)

  const deleteForm = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      email: email.name,
    },
  })
  const setAsPrimaryForm = useForm<SetAsPrimaryForm>({
    defaultValues: {
      csrfToken,
      isVerified: isVerified.toString(),
      email: email.name,
    },
  })

  async function onSetAsPrimary(values: SetAsPrimaryForm) {
    if (!isPrimary && !isVerified) return

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    await actions.email.setAsPrimary(formData)
    setPrimaryEmail(values.email)
  }

  async function onDeleteEmail(values: FormValues) {
    if (isPrimary) return

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }
    await actions.email.delete(formData)
    deleteEmail(values.email)
  }

  return (
    <div className="flex w-full flex-col items-start justify-between px-4 py-3 sm:flex-row sm:items-center">
      <div className="space-x-2 text-sm font-medium leading-none">
        <span className="text-muted-foreground">{email.name}</span>
        {isVerified && <Badge>Verified</Badge>}
        {!isVerified && <Badge>Unverified</Badge>}
        {isPrimary && <Badge>Primary</Badge>}
      </div>
      <div className="flex space-x-3">
        {!isVerified && (
          <Button variant="outline" size="sm">
            Resend verification email
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {!isPrimary && (
              <DropdownMenuItem
                className={cn(!isVerified && 'focus:bg-background data-[state=open]:bg-background')}
              >
                {isVerified && (
                  <form onSubmit={setAsPrimaryForm.handleSubmit(onSetAsPrimary)} className="w-full">
                    <input
                      {...setAsPrimaryForm.register(CSRF_TOKEN, { required: true })}
                      type="hidden"
                      name={CSRF_TOKEN}
                      value={csrfToken}
                    />
                    <input
                      {...setAsPrimaryForm.register('email', {
                        required: true,
                        pattern: /\S+@\S+\.\S+/,
                      })}
                      type="hidden"
                      name="email"
                      value={email.name}
                    />
                    <input
                      {...setAsPrimaryForm.register('isVerified', {
                        required: true,
                      })}
                      type="hidden"
                      name="isVerified"
                      value={isVerified.toString()}
                    />
                    <button type="submit" className="flex w-full justify-between">
                      Set as primary
                    </button>
                  </form>
                )}
                {!isVerified && (
                  <button disabled className="disabled text-muted-foreground">
                    Set as primary
                  </button>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className={cn(isPrimary && 'focus:bg-background data-[state=open]:bg-background')}
            >
              {!isPrimary && (
                <form onSubmit={deleteForm.handleSubmit(onDeleteEmail)} className="w-full">
                  <input
                    {...deleteForm.register(CSRF_TOKEN, { required: true })}
                    type="hidden"
                    name={CSRF_TOKEN}
                    value={csrfToken}
                  />
                  <input
                    {...deleteForm.register('email', { required: true, pattern: /\S+@\S+\.\S+/ })}
                    type="hidden"
                    name="email"
                    value={email.name}
                  />
                  <button type="submit" className="flex w-full justify-between text-destructive">
                    Delete
                  </button>
                </form>
              )}
              {isPrimary && (
                <button disabled className="disabled text-muted-foreground">
                  Delete
                </button>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
