import { MarkToolbarButton } from '@/components/plate-ui/mark-toolbar-button'
import { ToolbarGroup } from '@/components/plate-ui/toolbar'
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu'
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import type { TEditor } from '@udecode/plate-common'
import { Bold, Code, Italic, Strikethrough, Underline } from 'lucide-react'

export function FloatingToolbarButtons({ editor }: { editor: TEditor }) {
  return (
    <div className="w-full overflow-hidden">
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
          ariaLabel="Text formatting"
          noSeparator
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
      </div>
    </div>
  )
}
