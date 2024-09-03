import type { APIContext } from 'astro'
import { HMAC } from 'oslo/crypto'
import { createJWT, parseJWT } from 'oslo/jwt'

import { getProjectBySlugAndTeam } from '@/db/models/project'

import type { SelectProject } from '@/db/schema'

const secret = await new HMAC('SHA-256').generateKey()
const COOKIES_NAME = 'projectSession'

async function generateAndSetCookie(context: APIContext, project: SelectProject) {
  const jwt = await createJWT('HS256', secret, project)
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

export async function checkProjectSession(context: APIContext, next: Function) {
  const { projectSlug } = context.params
  const team = context.locals.team

  if (!projectSlug || !team) {
    context.locals.project = null
    clearCookie(context)
    return next()
  }

  const cookieVal = context.cookies.get(COOKIES_NAME)?.value || ''
  const { payload } = parseJWT(cookieVal) || {}
  const projectPayload = payload as SelectProject
  const isValidPayload: boolean =
    projectPayload?.slug === projectSlug && projectPayload.teamId === team.id
  let project: SelectProject | null = (isValidPayload && projectPayload) || null

  if (!project) {
    project = (await getProjectBySlugAndTeam({
      slug: projectSlug,
      teamId: team.id,
      fields: ['id', 'name', 'slug'],
    })) as SelectProject

    if (!project) {
      return context.redirect('/404')
    }
  }

  context.locals.project = project
  await generateAndSetCookie(context, project)

  return next()
}
