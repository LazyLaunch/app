import type { APIContext } from 'astro'
import { HMAC } from 'oslo/crypto'
import { createJWT, validateJWT } from 'oslo/jwt'

import { getUserTeam } from '@/db/models/userTeam'
import { hasPermission, type UserPermissionsEnum } from '@/lib/rbac'

import { JWT_ALGORITHM, SHA_HASH } from '@/constants'
import type { SelectUserTeam } from '@/db/schema'
import type { ActionAPIContext } from 'astro:actions'

const secret = await new HMAC(SHA_HASH).generateKey()
const COOKIES_NAME = 'userTeamSession'

async function generateAndSetCookie(
  context: APIContext | ActionAPIContext,
  payload: SelectUserTeam
) {
  const jwt = await createJWT(JWT_ALGORITHM, secret, payload)
  context.cookies.set(COOKIES_NAME, jwt, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    sameSite: 'lax',
  })
}

function clearCookie(context: APIContext | ActionAPIContext) {
  context.cookies.set(COOKIES_NAME, '', {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  })
}

async function getValidProjectFromJWT(
  jwt: string,
  userId: string,
  teamId: string
): Promise<SelectUserTeam | null> {
  try {
    const { payload } = await validateJWT(JWT_ALGORITHM, secret, jwt)
    const userTeamPayload = payload as SelectUserTeam
    const isValidPayload: boolean =
      userTeamPayload?.teamId === teamId && userTeamPayload.userId === userId
    return isValidPayload ? userTeamPayload : null
  } catch {
    return null
  }
}

export async function checkPermission(
  requiredPermission: UserPermissionsEnum,
  context: APIContext | ActionAPIContext,
  options: {
    teamId?: string
  } = {}
): Promise<boolean> {
  const user = context.locals.user!
  const teamId = context.locals.team?.id || options?.teamId

  if (!user || !teamId) {
    context.locals.userTeam = null
    clearCookie(context)
    return false
  }

  const jwt = context.cookies.get(COOKIES_NAME)?.value
  let userTeam = jwt ? await getValidProjectFromJWT(jwt, user.id, teamId) : null

  if (!userTeam) {
    userTeam = (await getUserTeam({ userId: user.id, teamId })) as SelectUserTeam | null

    if (!userTeam) {
      return false
    }
  }

  context.locals.userTeam = userTeam
  await generateAndSetCookie(context, userTeam!)
  const { role } = userTeam
  return role && hasPermission(role, requiredPermission)
}
