import { cn } from '@udecode/cn'
import { type Alignment } from '@udecode/plate-alignment'
import { setElements, type TEditor, type TElement } from '@udecode/plate-common'

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CustomElement extends TElement {
  type: string
  nodeProps?: {
    textAlign?: Alignment
  }
  attributes?: {
    style?: React.CSSProperties
  }
}

function setAlign(editor: TEditor, val: Alignment, element: CustomElement) {
  if (!editor) return
  const currentStyles = element.attributes?.style || {}
  const currentProps = element.nodeProps || {}

  setElements(
    editor,
    {
      nodeProps: {
        ...currentProps,
        textAlign: val,
      },
      attributes: {
        style: {
          ...currentStyles,
          textAlign: val,
        },
      },
    },
    {
      match: (n) => n.id === element.id && n.type === element.type,
    }
  )
}

export function AlignBtn({
  children,
  value,
  editor,
  element,
  defaultValue = 'left',
}: {
  editor: TEditor
  element: TElement
  children: any
  value: Alignment
  defaultValue?: Alignment
}) {
  const nodeProps = (element as CustomElement).nodeProps
  const textAlign = nodeProps?.textAlign || defaultValue

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            onClick={() => setAlign(editor, value, element)}
            className={cn('size-4 cursor-pointer', {
              'text-muted-foreground opacity-80': textAlign !== value,
              'text-foreground': defaultValue === value && nodeProps?.textAlign === undefined,
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
