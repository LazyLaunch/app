import { lucia } from '@/lib/auth'
import { verifyRequestOrigin } from 'oslo/request'
import { defineMiddleware } from 'astro:middleware'
import { createCSRFToken } from '@/lib/csrf-token'

import type { APIContext } from 'astro'

export const onRequest = defineMiddleware(async (context, next) => {
  if (isSafeMethod(context.request.method)) {
    await setCSRFTokenInCookie(context)
  } else {
    if (validateOrigin(context)) return new Response(null, { status: 403 })
    const isCsrfValid = await validateCSRFToken(context)
    if (!isCsrfValid) return new Response('Invalid CSRF token', { status: 403 })
  }

  await handleSession(context)

  return next()
})

async function setCSRFTokenInCookie({ cookies, locals }: APIContext): Promise<void> {
  const csrfToken = cookies.get('csrf_token')?.value

  if (csrfToken) {
    locals.csrfToken = csrfToken.split('|')[0]
  } else {
    const { cookie: cookieValue, csrfToken } = await createCSRFToken({})
    cookies.set('csrf_token', cookieValue, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
    })
    locals.csrfToken = csrfToken
  }
}

function validateOrigin({ request }: APIContext): boolean {
  const { method, headers } = request

  return !isSafeMethod(method) && !verifyOrigin(headers)
}

async function validateCSRFToken({ request, cookies }: APIContext): Promise<boolean> {
  const { headers } = request

  const csrfToken = cookies.get('csrf_token')?.value
  const requestToken = await getCsrfTokenFromRequest(headers, request)

  const { csrfTokenVerified } = await createCSRFToken({
    cookieValue: csrfToken,
    bodyValue: requestToken,
  })

  return csrfTokenVerified
}

function isSafeMethod(method: string): boolean {
  return method === 'GET'
}

function verifyOrigin(headers: Headers): boolean {
  const originHeader = headers.get('Origin')
  const hostHeader = headers.get('Host')

  return Boolean(originHeader && hostHeader && verifyRequestOrigin(originHeader, [hostHeader]))
}

async function getCsrfTokenFromRequest(headers: Headers, request: Request): Promise<string | null> {
  const contentType = headers.get('Content-Type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    return body.csrf_token
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData()
    return formData.get('csrf_token') as string
  }

  return headers.get('x-csrf-token')
}

async function handleSession({ cookies, locals }: APIContext): Promise<void> {
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
    locals.user = user
  } else {
    const sessionCookie = lucia.createBlankSessionCookie()
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    locals.user = null
    locals.session = null
  }
}
