import { lucia } from '@/lib/auth'

import type { SelectUser } from '@/db/schema'
import type { APIContext } from 'astro'

const SKIP_AUTH_URLS: string[] = [
  '/login',
  '/login/google',
  '/login/google/callback',
  '/signup',
  '/signup/google',
]

export async function checkSession(context: APIContext, next: Function) {
  await handleSession(context)

  const pathname = context.url.pathname
  if (!SKIP_AUTH_URLS.includes(pathname) && !context.locals.user) {
    return context.redirect('/login', 302)
  }

  return next()
}

async function handleSession({ cookies, locals }: APIContext): Promise<Response | void> {
  const sessionId = cookies.get(lucia.sessionCookieName)?.value

  if (!sessionId) {
    locals.user = null
    locals.session = null
    return
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (session) {
    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
    locals.session = session
    locals.user = user as SelectUser
  } else {
    const sessionCookie = lucia.createBlankSessionCookie()
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    locals.user = null
    locals.session = null
  }
}
