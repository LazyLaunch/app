import { useState } from 'react'

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import type { TEditor } from '@udecode/plate-common'
import { FontColorPlugin, FontSizePlugin } from '@udecode/plate-font/react'
import { Bold, Code, Italic, Strikethrough, Underline } from 'lucide-react'

import { ColorPicker } from '@/components/plate-ui/floating-toolbar/color-picker'
import { FontSizeInput } from '@/components/plate-ui/floating-toolbar/font-size-input'
import { LinkToolbarButton } from '@/components/plate-ui/floating-toolbar/link-toolbar-button'
import { MarkToolbarButton } from '@/components/plate-ui/mark-toolbar-button'
import { ToolbarGroup } from '@/components/plate-ui/toolbar'
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LinkPlugin } from '@udecode/plate-link/react'

export function FloatingToolbarButtons({ editor }: { editor: TEditor }) {
  const [isOpenTooltip, setOpenTooltip] = useState<boolean | undefined>(undefined)

  return (
    <div className="w-full">
      <div className="flex flex-wrap space-x-2.5">
        <ToolbarGroup type="single" value="single" ariaLabel="Turn into">
          <TurnIntoDropdownMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup
          value={[
            BoldPlugin.key,
            ItalicPlugin.key,
            UnderlinePlugin.key,
            StrikethroughPlugin.key,
            CodePlugin.key,
          ]}
          ariaLabel="Text marks"
        >
          <MarkToolbarButton nodeType={BoldPlugin.key} value={BoldPlugin.key} tooltip="Bold (⌘+B)">
            <Bold className="size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={ItalicPlugin.key}
            value={ItalicPlugin.key}
            tooltip="Italic (⌘+I)"
          >
            <Italic className="size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={UnderlinePlugin.key}
            value={UnderlinePlugin.key}
            tooltip="Underline (⌘+U)"
          >
            <Underline className="size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={StrikethroughPlugin.key}
            value={StrikethroughPlugin.key}
            tooltip="Strikethrough (⌘+⇧+M)"
          >
            <Strikethrough className="size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={CodePlugin.key} value={CodePlugin.key} tooltip="Code (⌘+E)">
            <Code className="size-4" />
          </MarkToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup value={[FontColorPlugin.key, FontSizePlugin.key]} ariaLabel="Text formatting">
          <TooltipProvider delayDuration={150}>
            <Tooltip open={isOpenTooltip}>
              <TooltipTrigger>
                <ColorPicker
                  editor={editor}
                  onSetOpenTooltip={setOpenTooltip}
                  nodeType={FontColorPlugin.key}
                />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="top">Text color</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={150}>
            <Tooltip open={isOpenTooltip}>
              <TooltipTrigger>
                <FontSizeInput editor={editor} nodeType={FontSizePlugin.key} />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="top">Font size</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </ToolbarGroup>
        <ToolbarGroup value={[LinkPlugin.key]} ariaLabel="Insert link" noSeparator>
          <LinkToolbarButton value={LinkPlugin.key} />
        </ToolbarGroup>
      </div>
    </div>
  )
}
