import { generateState, generateCodeVerifier } from 'arctic'
import { googleAuth } from '@/lib/auth'

import type { APIContext } from 'astro'

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ['openid', 'profile', 'email'],
  })
  url.searchParams.set('access_type', 'offline')

  context.cookies.set('google_oauth_state', state, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  context.cookies.set('google_oauth_code_verifier', codeVerifier, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  context.cookies.set('google_oauth_flow', 'login', {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  return context.redirect(url.toString())
}
