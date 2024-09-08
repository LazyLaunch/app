import { MarkToolbarButton } from '@/components/plate-ui/mark-toolbar-button'
import { ToolbarGroup } from '@/components/plate-ui/toolbar'
import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react'
import { Bold, Italic } from 'lucide-react'

export function FloatingToolbarButtons() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-wrap space-x-2.5">
        <ToolbarGroup
          value={[BoldPlugin.key, ItalicPlugin.key]}
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
        </ToolbarGroup>
      </div>
    </div>
  )
}
