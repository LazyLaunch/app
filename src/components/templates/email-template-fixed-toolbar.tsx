import { useStore } from '@nanostores/react'
import { actions } from 'astro:actions'
import { Paintbrush } from 'lucide-react'

import { EmailStyleFormComponent } from '@/components/templates/email-style-form-component'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { $emailTemplate, type EmailTemplateProps } from '@/stores/template-store'
import { CSRF_TOKEN } from '@/types'

export enum Action {
  CREATE = 'create',
  UPDATE = 'update',
}

interface EmailTemplateSubmitFormData {
  [CSRF_TOKEN]: string
  teamId: string
  projectId: string
  emailTemplate: EmailTemplateProps
  emailTemplateId?: string
  action: Action
}

async function handleSubmit(props: EmailTemplateSubmitFormData) {
  const { emailTemplate, action } = props
  const formData = new FormData()
  const columnIds = [CSRF_TOKEN, 'emailTemplateId', 'teamId', 'projectId']
  const templateColumns = ['name', 'description']
  const templateObjColumns = ['content', 'emoji', 'settings']

  for (const key of columnIds) {
    const val = props[key as keyof EmailTemplateSubmitFormData] as string
    val && formData.append(key, val)
  }
  for (const key of templateColumns) {
    const val = emailTemplate[key as keyof EmailTemplateProps] as string
    val && formData.append(key, val)
  }
  for (const key of templateObjColumns) {
    const val = emailTemplate[key as keyof EmailTemplateProps] as string
    val && formData.append(key, JSON.stringify(val))
  }

  const { data, error } = await actions.template[action](formData)
}

export function EmailTemplateFixedToolbar({
  csrfToken,
  teamId,
  projectId,
  emailTemplateId,
  action,
  settings,
}: {
  csrfToken: string
  teamId: string
  projectId: string
  emailTemplateId?: string
  action: Action
  settings: string
}) {
  const emailTemplate = useStore($emailTemplate)

  return (
    <div className="mx-auto flex w-full max-w-[600px]">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost">
            <Paintbrush className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Tabs defaultValue="styled">
            <div className="flex justify-between px-4 pt-4">
              <TabsList>
                <TabsTrigger value="styled">Styled</TabsTrigger>
                <TabsTrigger value="plain">Plain</TabsTrigger>
              </TabsList>
              <Button variant="ghost">Select language</Button>
            </div>
            <TabsContent
              value="styled"
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <EmailStyleFormComponent settings={settings} />
            </TabsContent>
            <TabsContent value="plain" className="focus-visible:ring-0">
              Change your password here.
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <Button
        onClick={() =>
          handleSubmit({ action, csrfToken, projectId, teamId, emailTemplate, emailTemplateId })
        }
      >
        Save
      </Button>
    </div>
  )
}
