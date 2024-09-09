import type { ClassNames, TEditor, TElement } from '@udecode/plate-common'
import { GripVertical } from 'lucide-react'
import type { DropTargetMonitor } from 'react-dnd'

import { cn, withRef } from '@udecode/cn'
import { type PlateElementProps, useEditorRef } from '@udecode/plate-common/react'
import { type DragItemNode, useDraggable, useDraggableState } from '@udecode/plate-dnd'
import { BlockSelectionPlugin } from '@udecode/plate-selection/react'

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '../ui/button'

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

const DragHandle = ({ element }: { element: TElement }) => {
  const editor = useEditorRef()

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="iconXs">
            <GripVertical
              className="size-4 text-muted-foreground"
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
          <TooltipContent side="bottom">Drag to move</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

export const Draggable = withRef<'div', DraggableProps>(
  ({ className, classNames = {}, onDropHandler, ...props }, ref) => {
    const { children, element } = props

    const state = useDraggableState({ element, onDropHandler })
    const { dropLine, isDragging, isHovered } = state
    const { droplineProps, groupProps, gutterLeftProps, handleRef, previewRef } =
      useDraggable(state)

    return (
      <div
        className={cn('relative', isDragging && 'opacity-50', 'group', className)}
        ref={ref}
        {...groupProps}
      >
        <div
          className={cn(
            'pointer-events-none absolute left-0 z-50 flex h-full -translate-x-full cursor-text opacity-0 group-hover:opacity-100',
            classNames.gutterLeft
          )}
          {...gutterLeftProps}
        >
          <div className={cn('mb-[7px] flex', classNames.blockToolbarWrapper)}>
            <div
              className={cn(
                'pointer-events-auto flex items-center pr-2.5',
                classNames.blockToolbar
              )}
            >
              <div className="size-4" data-key={element.id as string} ref={handleRef}>
                {isHovered && <DragHandle element={element} />}
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
