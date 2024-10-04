import { sequence } from 'astro/middleware'

import { checkProjectSession } from '@/middleware/check-project-session'
import { checkSession } from '@/middleware/check-session'
import { checkTeamSession } from '@/middleware/check-team-session'
import { validateCsrfToken } from '@/middleware/validate-csrf-token'

export const onRequest = sequence(
  validateCsrfToken,
  checkSession,
  checkTeamSession,
  checkProjectSession
)
