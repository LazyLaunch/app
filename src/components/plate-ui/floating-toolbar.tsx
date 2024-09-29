import { useRef } from 'react'

import { cn, withRef } from '@udecode/cn'
import {
  PortalBody,
  useComposedRef,
  useEditorId,
  useEventEditorSelectors,
} from '@udecode/plate-common/react'
import type { FloatingToolbarState } from '@udecode/plate-floating'
import { flip, offset, useFloatingToolbarState } from '@udecode/plate-floating'

import { useFloatingToolbar } from '@/components/plate-ui/floating-toolbar/useFloatingToolbar'
import { Toolbar } from '@/components/plate-ui/toolbar'

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

  const toolbarRef = useRef<HTMLDivElement>(null)
  const {
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState, toolbarRef)

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef)

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
