import { isCuid } from '@paralleldrive/cuid2'
import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import {
  createEmailTemplate,
  updateEmailTemplate,
  type UpdateEmailTemplateProps,
} from '@/db/models/email-template'
import { getTeamByIds } from '@/db/models/team'
import { UserPermissionsEnum } from '@/lib/rbac'
import { checkPermission } from '@/middleware/check-permission'
import type { ContentProps, EmailTemplateSettings, EmojiProps } from '@/stores/template-store'
import { ResponseStatusEnum, ResponseStatusMessageEnum } from '@/types'

const slateNodeSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    children: z.array(z.any()),
  })
)

const settingsNodeSchema = z.object({
  bgColor: z.string(),
  bodyColor: z.string(),
  borderColor: z.string(),
  borderWidth: z.number().min(0).max(10),
  borderRadius: z.number().min(0).max(20),
  bgVPadding: z.number().min(0).max(100),
  bodyVPadding: z.number().min(0).max(100),
  bgHPadding: z.number().min(0).max(100),
  bodyHPadding: z.number().min(0).max(100),
})

const emojiNodeSchema = z.object({
  id: z.string(),
  keywords: z.array(z.string()),
  name: z.string(),
  native: z.string().emoji({ message: 'Contains non-emoji characters.' }),
  shortcodes: z.string(),
  unified: z.string(),
})

const settingsSchema = z
  .string({
    required_error: 'Settings cannot be empty.',
    invalid_type_error: 'Settings must be a string.',
  })
  .transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val) as EmailTemplateSettings
      settingsNodeSchema.parse(parsed)
      return parsed
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Settings is not valid JSON or does not match the expected structure.',
      })
      return z.NEVER
    }
  })

const emojiSchema = z
  .string({
    required_error: 'Emoji cannot be empty.',
    invalid_type_error: 'Emoji must be a string.',
  })
  .transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val) as EmojiProps
      emojiNodeSchema.parse(parsed)
      return parsed
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Emoji is not valid JSON or does not match the expected structure.',
      })
      return z.NEVER
    }
  })

const contentSchema = z
  .string({
    required_error: 'Content cannot be empty.',
    invalid_type_error: 'Content must be a string.',
  })
  .transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val) as ContentProps[]
      slateNodeSchema.parse(parsed)
      return parsed
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Content is not valid JSON or does not match the expected structure.',
      })
      return z.NEVER
    }
  })

const baseSchema = z.object({
  teamId: z.string().refine(
    (val) => isCuid(val),
    () => ({
      message: 'Team ID is not valid.',
      path: ['teamId'],
    })
  ),
  csrfToken: z.string(),
  projectId: z.string().refine(
    (val) => isCuid(val),
    () => ({
      message: 'Project ID is not valid.',
      path: ['projectId'],
    })
  ),
  name: z
    .string({
      required_error: 'Name cannot be empty.',
      invalid_type_error: 'Name must be a string.',
    })
    .max(50),
  description: z.optional(z.string().max(256)),
  emoji: emojiSchema,
  content: contentSchema,
  settings: settingsSchema,
})

export const template = {
  create: defineAction({
    accept: 'form',
    input: baseSchema,
    handler: async (
      { name, description, settings, emoji, content, teamId, projectId },
      context
    ) => {
      const canAccess = await checkPermission(UserPermissionsEnum.CREATE, context, { teamId })
      if (!canAccess) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }

      const user = context.locals.user!
      const emailTemplate = await createEmailTemplate({
        name,
        description,
        content,
        emoji,
        settings,
        userId: user.id,
        projectId,
        teamId,
      })

      return Boolean(emailTemplate.id)
    },
  }),
  update: defineAction({
    accept: 'form',
    input: baseSchema.extend({
      emailTemplateId: z.string().refine(
        (val) => isCuid(val),
        () => ({
          message: 'Email template ID is not valid.',
          path: ['emailTemplateId'],
        })
      ),
    }),
    handler: async (input, context) => {
      const { teamId, emailTemplateId, content, emoji, settings, name, description, projectId } =
        input
      const canAccess = await checkPermission(UserPermissionsEnum.UPDATE, context, { teamId })
      if (!canAccess) {
        throw new ActionError({
          code: ResponseStatusEnum.UNAUTHORIZED,
          message: ResponseStatusMessageEnum.UNAUTHORIZED,
        })
      }
      const user = context.locals.user!
      const team = await getTeamByIds({
        teamId,
        userId: user.id,
      })

      const data: UpdateEmailTemplateProps = {
        id: emailTemplateId,
        content,
        emoji,
        settings,
        name,
        description,
        projectId,
      } as UpdateEmailTemplateProps

      if (team) {
        await updateEmailTemplate({ data, team })
      }
    },
  }),
}
