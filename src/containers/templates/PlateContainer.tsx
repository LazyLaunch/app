import { Paintbrush } from 'lucide-react'
import { useEffect, useState } from 'react'

import { isBlockAboveEmpty, isSelectionAtBlockStart } from '@udecode/plate-common'
import {
  focusEditor,
  ParagraphPlugin,
  Plate,
  PlateContent,
  usePlateEditor,
} from '@udecode/plate-common/react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { AlignPlugin } from '@udecode/plate-alignment/react'
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react'
import { DndPlugin } from '@udecode/plate-dnd'
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react'
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading'
import { HeadingPlugin } from '@udecode/plate-heading/react'
import { NodeIdPlugin } from '@udecode/plate-node-id'
import { ResetNodePlugin } from '@udecode/plate-reset-node/react'
import { BlockSelectionPlugin } from '@udecode/plate-selection/react'
import { BaseSlashPlugin } from '@udecode/plate-slash-command'
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block'

import { createPlateUI } from '@/components/plate-ui/create-plate-ui'
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar'
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons'
import { EmailStyleFormComponent } from '@/components/templates/EmailStyleFormComponent'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { BorderRadiusPlugin } from '@/components/plate-ui/plugins/border-radius/react'
import { LineHeightPlugin } from '@/components/plate-ui/plugins/line-height/react'
import { PaddingPlugin } from '@/components/plate-ui/plugins/padding/react'

import { TRIGGER } from '@/components/plate-ui/slash-input-element'

const ENTER_KEY = 'Enter' as const

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

const resetBlockTypesCommonRule = {
  types: [HEADING_KEYS.h1, HEADING_KEYS.h3, HEADING_KEYS.h3],
  defaultType: ParagraphPlugin.key,
}

export function PlateContainer({ plateNodeId }: { plateNodeId: string }) {
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
      BorderRadiusPlugin,
      PaddingPlugin,
      LineHeightPlugin,
      FontBackgroundColorPlugin,
      FontSizePlugin,
      FontColorPlugin,
      HeadingPlugin,
      BoldPlugin,
      CodePlugin,
      ItalicPlugin,
      StrikethroughPlugin,
      SubscriptPlugin,
      SuperscriptPlugin,
      AlignPlugin.configure({
        inject: {
          targetPlugins: [ParagraphPlugin.key, HEADING_KEYS.h1, HEADING_KEYS.h2, HEADING_KEYS.h3],
        },
      }),
      UnderlinePlugin,
      NodeIdPlugin,
      DndPlugin.configure({ options: { enableScroller: true } }),
      TrailingBlockPlugin.configure({
        options: { type: ParagraphPlugin.key },
      }),
      BlockSelectionPlugin.configure({
        options: {
          enableContextMenu: false,
        },
      }),
      BaseSlashPlugin.configure({ options: { trigger: TRIGGER } }),
      SoftBreakPlugin.configure({
        options: {
          rules: [
            { hotkey: 'shift+enter' },
            // {
            //   hotkey: 'enter',
            //   query: {
            //     allow: [
            //       CodeBlockPlugin.key,
            //       BlockquotePlugin.key,
            //       TableCellPlugin.key,
            //       TableCellHeaderPlugin.key,
            //     ],
            //   },
            // },
          ],
        },
      }),
      ResetNodePlugin.configure({
        options: {
          rules: [
            {
              ...resetBlockTypesCommonRule,
              hotkey: ENTER_KEY,
              predicate: isBlockAboveEmpty,
            },
            {
              ...resetBlockTypesCommonRule,
              hotkey: 'Backspace',
              predicate: isSelectionAtBlockStart,
            },
          ],
        },
      }),
      ExitBreakPlugin.configure({
        options: {
          rules: [
            {
              hotkey: 'mod+enter',
            },
            {
              hotkey: 'mod+shift+enter',
              before: true,
            },
            {
              hotkey: ENTER_KEY,
              query: {
                start: true,
                end: true,
                allow: HEADING_LEVELS,
              },
              relative: true,
              level: 1,
            },
          ],
        },
      }),
    ],
    override: {
      components: createPlateUI(),
    },
    value: [
      {
        id: plateNodeId,
        type: 'p',
        children: [{ text: '' }],
      },
    ],
  })

  useEffect(() => {
    focusEditor(editor)
  }, [editor])

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
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor}>
          <div
            style={{
              backgroundColor: templateProps.bgColor,
            }}
            className="min-h-screen w-full transition-all duration-300 ease-in-out"
          >
            <div
              className="mx-auto w-full max-w-[600px] transition-all duration-300 ease-in-out"
              style={{
                padding: `${templateProps.bgVPadding}px ${templateProps.bgHPadding}px`,
              }}
            >
              <div className="relative w-full">
                <PlateContent
                  className="relative min-h-20 w-full whitespace-pre-wrap break-words outline-0 transition-all duration-300 ease-in-out placeholder:text-muted-foreground"
                  data-plate-selectable
                  disableDefaultStyles
                  style={{
                    backgroundColor: templateProps.bodyColor,
                    padding: `${templateProps.bodyVPadding}px ${templateProps.bodyHPadding}px`,
                    borderRadius: `${templateProps.borderRadius}px`,
                    borderColor: templateProps.borderColor,
                    borderWidth: `${templateProps.borderWidth}px`,
                  }}
                  placeholder="Press '/' for commands"
                />
              </div>
            </div>
            <div className="group mt-10 size-full text-center">
              <p className="mx-auto w-full max-w-[600px] border-t border-input pt-4 text-xs font-medium tracking-wider text-gray-400/80 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
                End of email
              </p>
            </div>
          </div>
          <FloatingToolbar>
            <FloatingToolbarButtons editor={editor} />
          </FloatingToolbar>
        </Plate>
      </DndProvider>
    </>
  )
}
