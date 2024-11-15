import type { APIContext } from 'astro'
import { HMAC } from 'oslo/crypto'
import { createJWT, validateJWT } from 'oslo/jwt'

import { JWT_ALGORITHM, SHA_HASH } from '@/constants'
import { getProjectBySlugAndUser } from '@/db/models/project'

const secret = await new HMAC(SHA_HASH).generateKey()
const COOKIES_NAME = 'projectSession'

export interface ProjectSession {
  id: string
  name: string
  slug: string
  teamId: string
}

async function generateAndSetCookie(context: APIContext, payload: ProjectSession) {
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

async function getProjectFromDB(
  projectSlug: string,
  userId: string
): Promise<ProjectSession | null> {
  const project = await getProjectBySlugAndUser({
    slug: projectSlug,
    userId,
  })

  if (!project) return null

  const { name, slug, teamId, id } = project
  return { name, slug, teamId, id } as ProjectSession
}

async function getValidProjectFromJWT(
  jwt: string,
  projectSlug: string,
  teamId: string
): Promise<ProjectSession | null> {
  try {
    const { payload } = await validateJWT(JWT_ALGORITHM, secret, jwt)
    const projectPayload = payload as ProjectSession
    const isValidPayload: boolean =
      projectPayload?.slug === projectSlug && projectPayload.teamId === teamId
    return isValidPayload ? projectPayload : null
  } catch {
    return null
  }
}

export async function checkProjectSession(context: APIContext, next: Function) {
  const { projectSlug } = context.params
  const team = context.locals.team
  const user = context.locals.user

  if (!projectSlug || !team || !user) {
    context.locals.project = null
    clearCookie(context)
    return next()
  }

  const jwt = context.cookies.get(COOKIES_NAME)?.value
  let project = jwt ? await getValidProjectFromJWT(jwt, projectSlug, team.id) : null

  if (!project) {
    project = await getProjectFromDB(projectSlug, user.id)
    if (!project) {
      return context.redirect('/404')
    }
  }

  context.locals.project = project
  await generateAndSetCookie(context, project)

  return next()
}
