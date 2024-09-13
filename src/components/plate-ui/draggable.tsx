import { cn, withRef } from '@udecode/cn'
import { GripVertical } from 'lucide-react'

import type { ClassNames, TEditor, TElement } from '@udecode/plate-common'
import { type PlateElementProps, useEditorRef } from '@udecode/plate-common/react'
import { type DragItemNode, useDraggable, useDraggableState } from '@udecode/plate-dnd'
import { BlockSelectionPlugin } from '@udecode/plate-selection/react'
import type { DropTargetMonitor } from 'react-dnd'

import { FloatingNodeOptions } from '@/components/plate-ui/floating-node-options'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'

export interface DraggableProps
  extends PlateElementProps,
    ClassNames<{
      /** Block. */
      block: string

      /** Block and gutter. */
      blockAndGutter: string

      /** Block toolbar in the gutter. */
      blockToolbar: string

      /**
       * Block toolbar wrapper in the gutter left. It has the height of a line
       * of the block.
       */
      blockToolbarWrapper: string

      blockWrapper: string

      /** Button to dnd the block, in the block toolbar. */
      dragHandle: string

      /** Icon of the drag button, in the drag icon. */
      dragIcon: string

      /** Show a dropline above or below the block when dragging a block. */
      dropLine: string

      /** Gutter at the left side of the editor. It has the height of the block */
      gutterLeft: string
    }> {
  /**
   * Intercepts the drop handling. If `false` is returned, the default drop
   * behavior is called after. If `true` is returned, the default behavior is
   * not called.
   */
  onDropHandler?: (
    editor: TEditor,
    props: {
      dragItem: DragItemNode
      id: string
      monitor: DropTargetMonitor<DragItemNode, unknown>
      nodeRef: any
    }
  ) => boolean
}

const DragHandle = ({
  element,
  isFloatingOptionsOpen,
}: {
  element: TElement
  isFloatingOptionsOpen: boolean
}) => {
  const editor = useEditorRef()

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={isFloatingOptionsOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="iconXs">
            <GripVertical
              className="size-4 cursor-grab text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()

                if (element.id) {
                  editor
                    .getApi(BlockSelectionPlugin)
                    .blockSelection.addSelectedRow(element.id as string)
                }
              }}
              onMouseDown={() => {
                editor.getApi(BlockSelectionPlugin).blockSelection?.resetSelectedIds()
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="bottom">
            <b>Drag</b> to move
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

export const Draggable = withRef<'div', DraggableProps>(
  ({ className, classNames = {}, onDropHandler, ...props }, ref) => {
    const { children, element } = props
    const [isFloatingOptionsOpen, setFloatingOptionsOpen] = useState<boolean>(false)

    const state = useDraggableState({ element, onDropHandler })
    const { dropLine, isDragging, isHovered, setIsHovered } = state
    const { droplineProps, groupProps, gutterLeftProps, handleRef, previewRef } =
      useDraggable(state)

    const node = state.nodeRef.current
    if (node) {
      node.classList.add('rounded', 'ring-ring', 'transition', 'duration-150', 'ease-in-out')
      node.classList.toggle('ring-offset-2', isFloatingOptionsOpen)
      node.classList.toggle('ring-1', isFloatingOptionsOpen)
    }
    return (
      <div
        className={cn('relative', isDragging && 'opacity-50', 'group', className)}
        ref={ref}
        {...groupProps}
        onPointerEnter={() => !isHovered && groupProps.onPointerEnter()}
        onPointerLeave={() => !isFloatingOptionsOpen && groupProps.onPointerLeave()}
      >
        <div
          className={cn(
            classNames.gutterLeft,
            'pointer-events-none absolute left-0 z-50 flex h-full -translate-x-full cursor-text group-hover:opacity-100',
            !isHovered && 'opacity-0'
          )}
          {...gutterLeftProps}
        >
          <div className={cn('mb-[7px] flex space-x-2.5', classNames.blockToolbarWrapper)}>
            <div className="pointer-events-auto flex items-center">
              <div className="size-4">
                {isHovered && (
                  <FloatingNodeOptions
                    setIsHovered={setIsHovered}
                    setFloatingOptionsOpen={setFloatingOptionsOpen}
                    isFloatingOptionsOpen={isFloatingOptionsOpen}
                  />
                )}
              </div>
            </div>
            <div
              className={cn('pointer-events-auto flex items-center pr-3', classNames.blockToolbar)}
            >
              <div className="size-4" data-key={element.id as string} ref={handleRef}>
                {isHovered && (
                  <DragHandle element={element} isFloatingOptionsOpen={isFloatingOptionsOpen} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={classNames.blockWrapper} ref={previewRef}>
          {children}

          {!!dropLine && (
            <div
              className={cn(
                'absolute inset-x-0 h-0.5 opacity-100',
                'bg-ring',
                dropLine === 'top' && '-top-px',
                dropLine === 'bottom' && '-bottom-px',
                classNames.dropLine
              )}
              {...droplineProps}
            />
          )}
        </div>
      </div>
    )
  }
)
