import { email } from '@/actions/email'
import { template } from '@/actions/email-template'
import { project } from '@/actions/project'
import { team } from '@/actions/team'
import { user } from '@/actions/user'

export const server = {
  email,
  team,
  user,
  project,
  template,
}
