import { cn } from '@udecode/cn'

import type { SlateEditor, TEditor, TElement } from '@udecode/plate-common'

import type { Alignment } from '@udecode/plate-alignment'
import { setAlign } from '@udecode/plate-alignment'

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const DEFAULT_VAL: Alignment = 'left' as const

export function AlignBtn({
  children,
  value,
  editor,
  element,
  defaultValue = DEFAULT_VAL,
}: {
  editor: TEditor
  element: TElement
  children: any
  value: Alignment
  defaultValue?: Alignment
}) {
  const textAlign = element.align || defaultValue

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            onClick={() => setAlign(editor as SlateEditor, { value })}
            className={cn('size-4 cursor-pointer', {
              'text-muted-foreground opacity-80': textAlign !== value,
              'text-foreground': defaultValue === value && element.align === undefined,
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
