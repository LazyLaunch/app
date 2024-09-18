import { cn } from '@udecode/cn'
import { AlignCenter, AlignLeft, AlignRight, SlidersHorizontal } from 'lucide-react'

import { AlignBtn } from '@/components/plate-ui/floating-node-options/align-btn'
import { ColorInput } from '@/components/plate-ui/floating-node-options/color-input'
import { RowPadding } from '@/components/plate-ui/floating-node-options/row-padding'
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
import { setSelection, type SlateEditor, type TElement } from '@udecode/plate-common'
import { useEffect, useRef } from 'react'
import type { Editor } from 'slate'

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

function CardSection({ children, label }: { children: any; label: string }) {
  return (
    <div className="flex w-full flex-col gap-3 p-3">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <div className="flex w-full justify-between">{children}</div>
    </div>
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

  const handleOpenChange = (open: boolean) => {
    if (open) {
      requestAnimationFrame(() => {
        const activeElement = document?.activeElement
        if (activeElement instanceof HTMLElement) {
          activeElement.blur()
        }
      })
    }
  }

  useClickOutside(floatingSectionRef, onClickOutside)

  return (
    <Popover open={isFloatingOptionsOpen} onOpenChange={handleOpenChange}>
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
          <CardContent className="flex flex-col divide-y p-0">
            <CardSection label="Alignment">
              <AlignBtn value="left" editor={editor} element={element}>
                <AlignLeft className="size-4" />
              </AlignBtn>
              <AlignBtn value="center" editor={editor} element={element}>
                <AlignCenter className="size-4" />
              </AlignBtn>
              <AlignBtn value="right" editor={editor} element={element}>
                <AlignRight className="size-4" />
              </AlignBtn>
            </CardSection>
            <CardSection label="Background">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger>
                    <ColorInput element={element} editor={editor as Editor} />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="top">Background color</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </CardSection>
            <CardSection label="Padding">
              <RowPadding editor={editor as Editor} element={element} />
            </CardSection>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
