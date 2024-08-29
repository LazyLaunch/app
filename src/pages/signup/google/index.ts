import { generateState, generateCodeVerifier } from 'arctic'
import { googleAuth } from '@/lib/auth'

import type { APIContext, AstroCookies } from 'astro'
import type { OauthKeyName, GoogleOAuthScope } from '@/types'

import { OauthKeyNameEnum, GOOGLE_SCOPES, UserFlowEnum } from '@/types'

export async function GET({ cookies, redirect }: APIContext): Promise<Response> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const scopes: GoogleOAuthScope[] = [...GOOGLE_SCOPES]
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, { scopes })
  url.searchParams.set('access_type', 'offline')

  setCookie(cookies, OauthKeyNameEnum.GoogleOauthState, state)
  setCookie(cookies, OauthKeyNameEnum.GoogleOauthCodeVerifier, codeVerifier)
  setCookie(cookies, OauthKeyNameEnum.GoogleOauthFlow, UserFlowEnum.Signup)

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
