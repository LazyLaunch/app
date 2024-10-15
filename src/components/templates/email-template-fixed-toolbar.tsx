import { Paintbrush } from 'lucide-react'

import { EmailStyleFormComponent } from '@/components/templates/email-style-form-component'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  $emailTemplate,
  type ContentProps,
  type EmailTemplateSettings,
} from '@/stores/template-store'
import type { TEditor } from '@udecode/slate'

export interface EmailTemplateFixedToolbarProps {
  settings: EmailTemplateSettings
  editor: TEditor
}

export function EmailTemplateFixedToolbar({ settings, editor }: EmailTemplateFixedToolbarProps) {
  return (
    <div className="mx-auto flex w-full max-w-[600px] justify-end">
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
        onClick={() => {
          $emailTemplate.setKey('content', editor.children as ContentProps[])
          $emailTemplate.setKey('settings', settings)
          $emailTemplate.setKey('isSubmitForm', true)
        }}
      >
        Next
      </Button>
    </div>
  )
}
