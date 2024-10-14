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
  borderWidth: z.number(),
  borderRadius: z.number(),
  bgVPadding: z.number(),
  bodyVPadding: z.number(),
  bgHPadding: z.number(),
  bodyHPadding: z.number(),
})

const emojiNodeSchema = z.object({
  id: z.string(),
  keywords: z.array(z.string()),
  name: z.string(),
  native: z.string(),
  shortcodes: z.string(),
  unified: z.string(),
})

const settingsSchema = z
  .string({
    required_error: 'Settings cannot be empty.',
  })
  .refine(
    (val) => {
      if (typeof val === 'string' && val === 'undefined') return true
      try {
        const parsed = JSON.parse(val)
        settingsNodeSchema.parse(parsed)
        return true
      } catch (err) {
        return false
      }
    },
    {
      message: 'Settings is not valid JSON or does not match the expected structure.',
    }
  )

const emojiSchema = z
  .string({
    required_error: 'Emoji cannot be empty.',
  })
  .refine(
    (val) => {
      if (typeof val === 'string' && val === 'undefined') return true
      try {
        const parsed = JSON.parse(val)
        emojiNodeSchema.parse(parsed)
        return true
      } catch (err) {
        return false
      }
    },
    {
      message: 'Emoji is not valid JSON or does not match the expected structure.',
    }
  )

const contentSchema = z
  .string({
    required_error: 'Content cannot be empty.',
  })
  .refine(
    (val) => {
      if (typeof val === 'string' && val === 'undefined') return true
      try {
        const parsed = JSON.parse(val)
        slateNodeSchema.parse(parsed)
        return true
      } catch (err) {
        return false
      }
    },
    {
      message: 'Content is not valid JSON or does not match the expected structure.',
    }
  )

const baseSchema = z.object({
  teamId: z.string(),
  csrfToken: z.string(),
  projectId: z.string(),
})

export const template = {
  create: defineAction({
    accept: 'form',
    input: baseSchema.extend({
      name: z.string(),
      description: z.optional(z.string()),
      emoji: emojiSchema,
      content: contentSchema,
      settings: settingsSchema,
    }),
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
        emoji,
        content,
        settings,
        userId: user.id,
        projectId,
      })

      return Boolean(emailTemplate.id)
    },
  }),
  update: defineAction({
    accept: 'form',
    input: baseSchema.extend({
      name: z.optional(z.string()),
      description: z.optional(z.string()),
      emoji: emojiSchema.optional(),
      content: contentSchema.optional(),
      settings: settingsSchema.optional(),
      emailTemplateId: z.string(),
    }),
    handler: async (input, context) => {
      const { teamId, emailTemplateId } = input
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

      let isDirty: boolean = false
      const data: UpdateEmailTemplateProps = {
        id: emailTemplateId,
      } as UpdateEmailTemplateProps

      for (const key of ['content', 'emoji', 'settings', 'name', 'description', 'projectId']) {
        const val = input[key as keyof typeof input]
        if (typeof val === 'undefined' || (typeof val === 'string' && val === 'undefined')) continue
        data[key as keyof UpdateEmailTemplateProps] = val
        isDirty = true
      }

      if (isDirty && team) {
        await updateEmailTemplate({ data, team })
      }
    },
  }),
}
