import type { APIContext } from 'astro'
import { HMAC } from 'oslo/crypto'
import { createJWT, parseJWT } from 'oslo/jwt'

import { getTeamBySlugAndUser } from '@/db/models/team'
import type { SelectTeam } from '@/db/schema'

const secret = await new HMAC('SHA-256').generateKey()
const COOKIES_NAME = 'teamSession'

async function generateAndSetCookie(context: APIContext, team: SelectTeam) {
  const jwt = await createJWT('HS256', secret, team)
  context.cookies.set(COOKIES_NAME, jwt, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    sameSite: 'lax',
  })
}

function clearCookie(context: APIContext) {
  context.cookies.set(COOKIES_NAME, '', {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  })
}

export async function checkTeamSession(context: APIContext, next: Function) {
  const { teamSlug } = context.params
  const user = context.locals.user

  if (!teamSlug || !user) {
    context.locals.team = null
    clearCookie(context)
    return next()
  }

  const cookieVal = context.cookies.get(COOKIES_NAME)?.value || ''
  const { payload } = parseJWT(cookieVal) || {}
  const teamPayload = payload as SelectTeam
  const isValidPayload: boolean = teamPayload?.slug === teamSlug && teamPayload.userId === user.id
  let team: SelectTeam | null = (isValidPayload && teamPayload) || null

  if (!team) {
    team = (await getTeamBySlugAndUser({
      slug: teamSlug,
      userId: user.id,
      fields: ['id', 'name', 'slug', 'address'],
    })) as SelectTeam

    if (!team) {
      return context.redirect('/404')
    }
  }

  context.locals.team = team
  await generateAndSetCookie(context, team)

  return next()
}
