import { contact } from '@/actions/contact'
import { email } from '@/actions/email'
import { template } from '@/actions/email-template'
import { project } from '@/actions/project'
import { team } from '@/actions/team'
import { user } from '@/actions/user'

export type ListActions = 'email' | 'team' | 'user' | 'project' | 'template' | 'contact'
export type ServerActions = Record<
  ListActions,
  Record<string, (formData: FormData) => Promise<{ data: any }>>
>

export const server: ServerActions = {
  email,
  team,
  user,
  project,
  template,
  contact,
}
