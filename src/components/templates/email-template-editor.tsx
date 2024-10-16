import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

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
import { LinkPlugin } from '@udecode/plate-link/react'
import { NodeIdPlugin } from '@udecode/plate-node-id'
import { ResetNodePlugin } from '@udecode/plate-reset-node/react'
import { BlockSelectionPlugin } from '@udecode/plate-selection/react'
import { BaseSlashPlugin } from '@udecode/plate-slash-command'
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block'

import { createPlateUI } from '@/components/plate-ui/create-plate-ui'
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar'
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons'

import { BorderRadiusPlugin } from '@/components/plate-ui/plugins/border-radius/react'
import { LineHeightPlugin } from '@/components/plate-ui/plugins/line-height/react'
import { PaddingPlugin } from '@/components/plate-ui/plugins/padding/react'

import { LinkFloatingToolbar } from '@/components/plate-ui/floating-toolbar/link-floating-toolbar'
import { TRIGGER } from '@/components/plate-ui/slash-input-element'
import { EmailTemplateFixedToolbar } from '@/components/templates/email-template-fixed-toolbar'

import {
  $emailTemplate,
  type ContentProps,
  type EmailTemplateSettings,
} from '@/stores/template-store'

const ENTER_KEY = 'Enter' as const

const resetBlockTypesCommonRule = {
  types: [HEADING_KEYS.h1, HEADING_KEYS.h3, HEADING_KEYS.h3],
  defaultType: ParagraphPlugin.key,
}

interface Props {
  content: ContentProps[]
  settings: EmailTemplateSettings
}

export function EmailTemplateEditor({ content, settings }: Props) {
  const emailTemplate = useStore($emailTemplate)
  const _settings = emailTemplate.settings || settings
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
                allow: [...HEADING_LEVELS, ParagraphPlugin.key],
              },
              relative: true,
              level: 1,
            },
          ],
        },
      }),
      LinkPlugin.configure({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
    ],
    override: {
      components: createPlateUI(),
    },
    value: content,
  })

  useEffect(() => {
    focusEditor(editor)
  }, [editor])

  if (emailTemplate.isSubmitForm) return null

  return (
    <>
      <EmailTemplateFixedToolbar settings={_settings} editor={editor} />
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor}>
          <div
            style={{
              backgroundColor: _settings.bgColor,
            }}
            className="min-h-[calc(100vh_-_128px)] w-full transition-all duration-300 ease-in-out"
          >
            <div
              className="mx-auto w-full max-w-[600px] transition-all duration-300 ease-in-out"
              style={{
                padding: `${_settings.bgVPadding}px ${_settings.bgHPadding}px`,
              }}
            >
              <div className="relative w-full">
                <PlateContent
                  className="relative min-h-20 w-full whitespace-pre-wrap break-words outline-0 transition-all duration-300 ease-in-out placeholder:text-muted-foreground"
                  data-plate-selectable
                  disableDefaultStyles
                  style={{
                    backgroundColor: _settings.bodyColor,
                    padding: `${_settings.bodyVPadding}px ${_settings.bodyHPadding}px`,
                    borderRadius: `${_settings.borderRadius}px`,
                    borderColor: _settings.borderColor,
                    borderWidth: `${_settings.borderWidth}px`,
                  }}
                  placeholder={`Press '${TRIGGER}' for commands`}
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
