import { ParagraphPlugin, Plate, usePlateEditor } from '@udecode/plate-common/react'
import { Paintbrush } from 'lucide-react'
import { useState } from 'react'

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import { HeadingPlugin } from '@udecode/plate-heading/react'

import { Editor } from '@/components/plate-ui/editor'

import { createPlateUI } from '@/components/plate-ui/create-plate-ui'
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar'
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons'
import { EmailStyleFormComponent } from '@/components/templates/EmailStyleFormComponent'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface FormValues {
  bgColor: string
  bodyColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  bgVPadding: number
  bodyVPadding: number
  bgHPadding: number
  bodyHPadding: number
}

export function PlateContainer() {
  const [templateProps, setTemplateProps] = useState<FormValues>({
    bgColor: 'transparent',
    bodyColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 4,
    bgVPadding: 0,
    bodyVPadding: 0,
    bgHPadding: 0,
    bodyHPadding: 0,
  })

  const editor = usePlateEditor({
    plugins: [
      HeadingPlugin,
      BoldPlugin,
      CodePlugin,
      ItalicPlugin,
      StrikethroughPlugin,
      SubscriptPlugin,
      SuperscriptPlugin,
      UnderlinePlugin,
    ],
    value: [
      {
        id: '1',
        type: ParagraphPlugin.key,
        children: [{ text: 'Hello world' }],
      },
    ],
    override: {
      components: createPlateUI(),
    },
  })

  return (
    <>
      <div className="mx-auto w-full max-w-[600px]">
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
                <EmailStyleFormComponent {...templateProps} onSubmit={setTemplateProps} />
              </TabsContent>
              <TabsContent value="plain" className="focus-visible:ring-0">
                Change your password here.
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>
      <Plate editor={editor}>
        <div
          style={{
            backgroundColor: templateProps.bgColor,
          }}
          className="h-screen w-full transition-all duration-300 ease-in-out"
        >
          <div
            className="mx-auto w-full max-w-[600px] transition-all duration-300 ease-in-out"
            style={{
              padding: `${templateProps.bgVPadding}px ${templateProps.bgHPadding}px`,
            }}
          >
            <Editor
              style={{
                backgroundColor: templateProps.bodyColor,
                padding: `${templateProps.bodyVPadding}px ${templateProps.bodyHPadding}px`,
                borderRadius: `${templateProps.borderRadius}px`,
                borderColor: templateProps.borderColor,
                borderWidth: `${templateProps.borderWidth}px`,
              }}
              className="outline-0 transition-all duration-300 ease-in-out"
              placeholder="Type..."
            />
          </div>
        </div>
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </>
  )
}
