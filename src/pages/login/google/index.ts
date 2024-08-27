import { generateState, generateCodeVerifier } from 'arctic'
import { googleAuth } from '@/lib/auth'

import type { APIContext, AstroCookies } from 'astro'
import type { OauthKeyName, GoogleOAuthScope } from '@/types'

import { OauthKeyNameEnum, GOOGLE_SCOPES, UserFlow } from '@/types'

export async function GET({ cookies, redirect, locals }: APIContext): Promise<Response> {
  if (locals.user) return redirect('/')

  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const scopes: GoogleOAuthScope[] = [...GOOGLE_SCOPES]
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, { scopes })
  url.searchParams.set('access_type', 'offline')

  setCookie(cookies, OauthKeyNameEnum.GoogleOauthState, state)
  setCookie(cookies, OauthKeyNameEnum.GoogleOauthCodeVerifier, codeVerifier)
  setCookie(cookies, OauthKeyNameEnum.GoogleOauthFlow, UserFlow.Login)

  return redirect(url.toString())
}

function setCookie(cookies: AstroCookies, key: OauthKeyName, val: string): void {
  cookies.set(key, val, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })
}
