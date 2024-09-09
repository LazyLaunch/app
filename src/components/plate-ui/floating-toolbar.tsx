import { Toolbar } from '@/components/plate-ui/toolbar'
import { cn, withRef } from '@udecode/cn'
import {
  PortalBody,
  useComposedRef,
  useEditorId,
  useEventEditorSelectors,
} from '@udecode/plate-common/react'
import { flip, offset, useFloatingToolbar, useFloatingToolbarState } from '@udecode/plate-floating'

import type { FloatingToolbarState } from '@udecode/plate-floating'
import { useCallback, useEffect, useRef } from 'react'

function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    },
    [ref, handler]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [handleClickOutside])
}

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState
  }
>(({ children, state, ...props }, componentRef) => {
  const editorId = useEditorId()
  const focusedEditorId = useEventEditorSelectors.focus()

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
          padding: 12,
        }),
      ],
      placement: 'top',
      ...state?.floatingOptions,
    },
  })

  const { hidden, props: rootProps, ref: floatingRef } = useFloatingToolbar(floatingToolbarState)

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef)

  const toolbarRef = useRef<HTMLDivElement>(null)
  const onClose = () => {
    floatingToolbarState.setOpen(false)
    floatingToolbarState.setMousedown(true)
  }
  useClickOutside(toolbarRef, onClose)

  if (hidden) return null

  return (
    <PortalBody>
      <div ref={toolbarRef}>
        <Toolbar
          className={cn(
            'absolute z-50 whitespace-nowrap border bg-popover p-2.5 opacity-100 shadow-md print:hidden'
          )}
          ref={ref}
          {...rootProps}
          {...props}
        >
          {children}
        </Toolbar>
      </div>
    </PortalBody>
  )
})
