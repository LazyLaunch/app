import { sequence } from 'astro/middleware'

import { checkSession } from '@/middleware/checkSession'
import { checkTeamSession } from '@/middleware/checkTeamSession'
import { validateCsrfToken } from '@/middleware/validateCsrfToken'

export const onRequest = sequence(validateCsrfToken, checkSession, checkTeamSession)
