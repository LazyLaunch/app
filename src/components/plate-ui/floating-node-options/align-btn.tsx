import { cn } from '@udecode/cn'
import { setAlign, type Alignment } from '@udecode/plate-alignment'
import { type SlateEditor, type TElement } from '@udecode/plate-common'

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AlignBtn({
  children,
  value,
  editor,
  element,
  defaultValue = 'left',
}: {
  editor: SlateEditor
  element: TElement
  children: any
  value: Alignment
  defaultValue?: Alignment
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            onClick={() => setAlign(editor, { value })}
            className={cn('size-4 cursor-pointer hover:opacity-100', {
              'opacity-40': element.align !== value,
              'opacity-100': defaultValue === value && element.align === undefined,
            })}
          >
            {children}
          </a>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent sideOffset={10} side="top">
            Align {value}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}
