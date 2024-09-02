import type { APIContext } from 'astro'

import { getTeamBySlugAndUser } from '@/db/models/team'
import type { SelectTeam } from '@/db/schema'

export async function checkTeamSession(context: APIContext, next: Function) {
  const { teamSlug } = context.params
  const user = context.locals.user

  if (teamSlug && user) {
    const team = await getTeamBySlugAndUser({
      slug: teamSlug,
      userId: user.id,
      fields: ['name', 'slug', 'address'],
    })
    if (!team) return context.redirect('/404')

    context.locals.team = team as SelectTeam
  } else {
    context.locals.team = null
  }

  return next()
}
