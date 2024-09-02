import { createCSRFToken } from '@/lib/csrf-token'
import type { APIContext } from 'astro'

import { verifyRequestOrigin } from 'oslo/request'

import { CSRF_TOKEN } from '@/types'

export async function validateCsrfToken(context: APIContext, next: Function) {
  if (isSafeMethod(context.request.method)) {
    await setCSRFTokenInCookie(context)
  } else {
    if (validateOrigin(context)) return new Response(null, { status: 403 })
    const isCsrfValid = await validateCSRFToken(context)
    if (!isCsrfValid) return new Response('Invalid CSRF token', { status: 403 })
  }

  return next()
}

function isSafeMethod(method: string): boolean {
  return method === 'GET'
}

function verifyOrigin(headers: Headers): boolean {
  const originHeader = headers.get('Origin')
  const hostHeader = headers.get('Host')

  return Boolean(originHeader && hostHeader && verifyRequestOrigin(originHeader, [hostHeader]))
}

async function setCSRFTokenInCookie({ cookies, locals }: APIContext): Promise<void> {
  const csrfToken = cookies.get(CSRF_TOKEN)?.value

  if (csrfToken) {
    locals.csrfToken = csrfToken.split('|')[0]
  } else {
    const { cookie: cookieValue, csrfToken } = await createCSRFToken({})
    cookies.set(CSRF_TOKEN, cookieValue, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
    })
    locals.csrfToken = csrfToken
  }
}

async function validateCSRFToken({ request, cookies, locals }: APIContext): Promise<boolean> {
  const { headers } = request

  const csrfToken = cookies.get(CSRF_TOKEN)?.value
  const requestToken = await getCsrfTokenFromRequest(headers, request, locals)

  const { csrfTokenVerified } = await createCSRFToken({
    cookieValue: csrfToken,
    bodyValue: requestToken,
  })

  return csrfTokenVerified
}

function validateOrigin({ request }: APIContext): boolean {
  const { method, headers } = request

  return !isSafeMethod(method) && !verifyOrigin(headers)
}

async function getCsrfTokenFromRequest(
  headers: Headers,
  request: Request,
  locals: App.Locals
): Promise<string | null> {
  const contentType = headers.get('Content-Type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    return body.csrfToken
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.clone().formData()
    locals.formDataParsed = formData
    return formData.get(CSRF_TOKEN) as string
  }

  return headers.get('x-csrf-token')
}
