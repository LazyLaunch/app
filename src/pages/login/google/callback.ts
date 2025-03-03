import slug from 'slug'

import { googleAuth, lucia } from '@/lib/auth'
import { OAuth2RequestError } from 'arctic'
import { alphabet, generateRandomString } from 'oslo/crypto'
import { parseJWT } from 'oslo/jwt'

import { getAccountByProvider, linkAccount } from '@/db/models/account'
import { createEmail, existsPrimaryEmail } from '@/db/models/email'

import { SLUG_RANDOM_STRING_SIZE } from '@/constants'
import { createUser } from '@/db/models/user'
import { UserErrorFlowEnum, UserFlowEnum } from '@/enums'

import type { SelectAccount, SelectSession } from '@/db/schema'
import type { APIContext, AstroCookies } from 'astro'

const DEFAULT_TYPE = 'oauth'
const DEFAULT_PROVIDER = 'google'
const DEFAULT_TOKEN_TYPE = 'oidc'

interface GoogleUser {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  exp: number
}

interface GoogleTokens {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: Date
  idToken: string
}

export async function GET(context: APIContext): Promise<Response> {
  if (context.locals.user) return context.redirect('/')

  const searchParams = context.url.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const storedState = context.cookies.get('google_oauth_state')?.value ?? null
  const storedCodeVerifier = context.cookies.get('google_oauth_code_verifier')?.value ?? null
  const flowType = context.cookies.get('google_oauth_flow')?.value ?? null

  if (
    !flowType ||
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 })
  }

  try {
    const tokens: GoogleTokens = await googleAuth.validateAuthorizationCode(
      code,
      storedCodeVerifier
    )
    const data = parseJWT(tokens.idToken)!.payload as GoogleUser
    if (!data.email_verified)
      return context.redirect(`/signup?error=${UserErrorFlowEnum.EMAIL_NOT_VERIFIED}`)

    const account = await getAccountByProvider({
      provider: DEFAULT_PROVIDER,
      providerAccountId: data.sub,
    })

    if (flowType === UserFlowEnum.Login) {
      if (!account) return context.redirect(`/login?error=${UserErrorFlowEnum.ACCOUNT_NOT_FOUND}`)

      await setSession(account, context.cookies)
      return context.redirect('/')
    } else if (flowType === UserFlowEnum.Signup) {
      if (account)
        return context.redirect(`/signup?error=${UserErrorFlowEnum.ACCOUNT_ALREADY_EXISTS}`)

      const { name, email, email_verified, picture, sub, exp } = data
      const username = slug(
        `${name}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
      )
      const user = await createUser({
        name,
        email,
        picture,
        username,
      })
      const isExistsPrimaryEmail = await existsPrimaryEmail(email, user.id)
      await createEmail({
        name: email,
        userId: user.id,
        verified: email_verified,
        primary: !isExistsPrimaryEmail,
      })
      // const expiresAt = Math.floor(new Date(`${tokens.accessTokenExpiresAt}`).getTime() / 1000)

      const linkedAccount = await linkAccount({
        userId: user.id,
        type: DEFAULT_TYPE,
        provider: DEFAULT_PROVIDER,
        providerAccountId: sub,
        refreshToken: tokens.refreshToken,
        accessToken: tokens.accessToken,
        expiresAt: exp,
        tokenType: DEFAULT_TOKEN_TYPE,
        scope: searchParams.get('scope'),
        idToken: tokens.idToken,
      })

      await setSession(linkedAccount, context.cookies)
      return context.redirect('/get-started')
    }

    return context.redirect(`/login?error=${UserErrorFlowEnum.INVALID_FLOW}`)
  } catch (e) {
    console.warn('DEBUGPRINT[1]: callback.ts:99: e=', e)
    if (e instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 })
    }
    return new Response(null, { status: 500 })
  }
}

async function setSession(account: SelectAccount, cookies: AstroCookies) {
  const session = await lucia.createSession(`${account.userId}`, {} as SelectSession)
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}
