import type { APIContext } from 'astro'

import type { InsertUser } from '@/db/schema'
import { ResponseStatus, ResponseCode } from '@/types'

import { updateUser } from '@/db/models/user'

interface UserProps extends Omit<InsertUser, 'name' | 'email'> {
  name: string
  email: string
}

export async function PUT(context: APIContext): Promise<Response> {
  const user = context.locals.user!
  const formData = context.locals.formDataParsed!

  const name = formData.get('name')
  const email: string = formData.get('email') as string

  if (!name || !email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(
      JSON.stringify({
        status: ResponseStatus.Error,
        message: 'Some fields are not valid.',
      }),
      { status: ResponseCode.Error }
    )
  }

  const data = { name, email } as UserProps
  await updateUser(user.id, data)

  return new Response(
    JSON.stringify({
      status: ResponseStatus.Success,
    }),
    { status: ResponseCode.Success }
  )
}
