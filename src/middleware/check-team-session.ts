import type { APIContext } from 'astro'
import { HMAC } from 'oslo/crypto'
import { createJWT, validateJWT } from 'oslo/jwt'

import { JWT_ALGORITHM, SHA_HASH } from '@/constants'
import { getTeamBySlugAndUser } from '@/db/models/team'
import type { UserRoles } from '@/lib/rbac'

const secret = await new HMAC(SHA_HASH).generateKey()
const COOKIES_NAME = 'teamSession'

export interface TeamSession {
  id: string
  name: string
  slug: string
  address: string
  role: UserRoles
  userId: string
}

async function generateAndSetCookie(context: APIContext, payload: TeamSession) {
  const jwt = await createJWT(JWT_ALGORITHM, secret, payload)
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

async function getTeamFromDB(teamSlug: string, userId: string): Promise<TeamSession | null> {
  const team = await getTeamBySlugAndUser({
    slug: teamSlug,
    userId,
  })

  if (!team) return null

  const { id, name, slug, address, role } = team
  return { id, name, slug, address, role, userId } as TeamSession
}

async function getValidTeamFromJWT(
  jwt: string,
  teamSlug: string,
  userId: string
): Promise<TeamSession | null> {
  try {
    const { payload } = await validateJWT(JWT_ALGORITHM, secret, jwt)
    const teamPayload = payload as TeamSession
    const isValidPayload: boolean = teamPayload?.slug === teamSlug && teamPayload.userId === userId
    return isValidPayload ? teamPayload : null
  } catch {
    return null
  }
}

export async function checkTeamSession(context: APIContext, next: Function) {
  const { teamSlug } = context.params
  const user = context.locals.user

  if (!teamSlug || !user) {
    context.locals.team = null
    clearCookie(context)
    return next()
  }

  const jwt = context.cookies.get(COOKIES_NAME)?.value
  let team = jwt ? await getValidTeamFromJWT(jwt, teamSlug, user.id) : null

  if (!team) {
    team = await getTeamFromDB(teamSlug, user.id)

    if (!team) {
      return context.redirect('/404')
    }
  }

  context.locals.team = team
  await generateAndSetCookie(context, team)

  return next()
}
