import { cn } from '@udecode/cn'
import { AlignCenter, AlignLeft, AlignRight, SlidersHorizontal } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { setAlign, type Alignment } from '@udecode/plate-alignment'
import { setSelection, type SlateEditor, type TElement } from '@udecode/plate-common'
import { useEffect, useRef } from 'react'

function findRowById(editor: SlateEditor, id: string) {
  return editor.children.findIndex((node) => node.id === id)
}

function setCursorToRow(editor: SlateEditor, row: number) {
  const node = editor.children[row]

  if (!node) return

  setSelection(editor, {
    anchor: { path: [row, 0], offset: 0 },
    focus: { path: [row, 0], offset: 0 },
  })
}

function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [ref, handler])
}

function AlignBtn({
  children,
  value,
  editor,
  element,
}: {
  editor: SlateEditor
  element: TElement
  children: any
  value: Alignment
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            onClick={() => setAlign(editor, { value })}
            className={cn(
              'size-4 cursor-pointer hover:opacity-100',
              element.align !== value && 'opacity-40'
            )}
          >
            {children}
          </a>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="bottom">Align {value}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

interface Props {
  setIsHovered: (isOpen: boolean) => void
  setFloatingOptionsOpen: (isOpen: boolean) => void
  isFloatingOptionsOpen: boolean
  editor: SlateEditor
  element: TElement
}

export function FloatingNodeOptions({
  setIsHovered,
  setFloatingOptionsOpen,
  isFloatingOptionsOpen,
  element,
  editor,
}: Props) {
  const floatingSectionRef = useRef<HTMLDivElement>(null)
  const onClickOutside = () => {
    setIsHovered(false)
    setFloatingOptionsOpen(false)
  }

  useClickOutside(floatingSectionRef, onClickOutside)

  return (
    <Popover open={isFloatingOptionsOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip open={isFloatingOptionsOpen ? false : undefined}>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: 'ghost', size: 'iconXs' }), 'ml-0.5')}
            onClick={() => {
              const nodeIndex = findRowById(editor, element.id as string)
              setCursorToRow(editor, nodeIndex)
              setFloatingOptionsOpen(true)
            }}
          >
            <TooltipTrigger asChild>
              <SlidersHorizontal className="size-3 cursor-pointer text-muted-foreground" />
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipPortal>
            <TooltipContent sideOffset={10} side="bottom">
              <b>Click</b> for more options
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent asChild side="left" ref={floatingSectionRef}>
        <Card className="w-44 p-0">
          <CardContent className="flex p-0">
            <div className="flex w-full flex-col gap-3 p-3">
              <p className="text-xs font-semibold text-foreground">Alignment</p>
              <div className="flex w-full justify-between">
                <AlignBtn value="left" editor={editor} element={element}>
                  <AlignLeft className="size-4" />
                </AlignBtn>
                <AlignBtn value="center" editor={editor} element={element}>
                  <AlignCenter className="size-4" />
                </AlignBtn>
                <AlignBtn value="right" editor={editor} element={element}>
                  <AlignRight className="size-4" />
                </AlignBtn>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
