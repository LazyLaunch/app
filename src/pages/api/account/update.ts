import type { APIContext } from 'astro'

import type { InsertUser } from '@/db/schema'
import { ResponseStatus, ResponseCode, CSRF_TOKEN } from '@/types'

import { updateUser } from '@/db/models/user'

interface UserProps extends Omit<InsertUser, 'name' | 'email'> {
  name: string
  email: string
}

const VALID_FIELDS = ['name', 'email'] as const
const PATTERNS: Partial<Record<(typeof VALID_FIELDS)[number], RegExp>> = {
  email: /\S+@\S+\.\S+/,
}

export async function PUT(context: APIContext): Promise<Response> {
  const user = context.locals.user!
  const formData = context.locals.formDataParsed! as FormData

  const data: Partial<UserProps> = {
    name: user.name,
    email: user.email,
  }
  let isDirty: boolean = false

  for (const key of formData.keys()) {
    if (key === CSRF_TOKEN || data[key as keyof UserProps] === formData.get(key)) continue

    if (!VALID_FIELDS.includes(key as (typeof VALID_FIELDS)[number])) {
      return new Response(
        JSON.stringify({
          status: ResponseStatus.Error,
          message: `Couldn't find field: ${key}.`,
        }),
        { status: ResponseCode.Error }
      )
    }

    const val = formData.get(key)
    if (!validateField(key, val)) {
      return new Response(
        JSON.stringify({
          status: ResponseStatus.Error,
          message: `${key} is not valid.`,
        }),
        { status: ResponseCode.Error }
      )
    }

    data[key as keyof UserProps] = val as string
    isDirty = true
  }

  if (isDirty) await updateUser(user.id, data as UserProps)

  return new Response(
    JSON.stringify({
      status: ResponseStatus.Success,
    }),
    { status: ResponseCode.Success }
  )
}

function validateField(key: string, val: FormDataEntryValue | null): boolean {
  if (!val) return false
  const pattern = PATTERNS[key as keyof typeof PATTERNS]
  if (pattern && !pattern.test(val.toString())) return false

  return true
}
