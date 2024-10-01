import type { useFloatingToolbarState } from '@udecode/plate-floating'
import React, { useCallback, useEffect, useRef, useState } from 'react'

export const useFloatingToolbar = (
  {
    editorId,
    floating,
    focusedEditorId,
    hideToolbar,
    mousedown,
    open,
    readOnly,
    selectionExpanded,
    selectionText,
    setOpen,
    setWaitForCollapsedSelection,
    showWhenReadOnly,
    waitForCollapsedSelection,
  }: ReturnType<typeof useFloatingToolbarState>,
  toolbarRef: React.RefObject<HTMLDivElement>
) => {
  const [clickedOutside, setClickedOutside] = useState(false)
  const prevOpen = useRef(open)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const updateOpenState = useCallback(() => {
    const shouldOpen =
      !clickedOutside &&
      selectionText &&
      selectionExpanded &&
      (!waitForCollapsedSelection || readOnly)

    const shouldClose =
      clickedOutside ||
      !selectionExpanded ||
      !selectionText ||
      (mousedown && !open) ||
      hideToolbar ||
      (readOnly && !showWhenReadOnly)

    // Use debouncing to prevent multiple rapid state changes
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      if (shouldClose && prevOpen.current) {
        setOpen(false)
        prevOpen.current = false
      } else if (shouldOpen && !prevOpen.current) {
        setOpen(true)
        prevOpen.current = true
      }
    }, 50)
  }, [
    clickedOutside,
    selectionExpanded,
    selectionText,
    mousedown,
    open,
    hideToolbar,
    showWhenReadOnly,
    waitForCollapsedSelection,
    readOnly,
    setOpen,
  ])

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setClickedOutside(true)
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [toolbarRef, setOpen])

  useEffect(() => {
    if (selectionExpanded && !mousedown && selectionText) {
      setClickedOutside(false)
    }
    updateOpenState()
  }, [selectionExpanded, selectionText, mousedown, updateOpenState])

  const { update } = floating

  const selectionTextLength = selectionText?.length ?? 0

  useEffect(() => {
    if (selectionTextLength > 0) {
      update?.()
    }
  }, [selectionTextLength, update])

  useEffect(() => {
    if (editorId !== focusedEditorId) {
      setWaitForCollapsedSelection(true)
    }
    if (!selectionExpanded) {
      setWaitForCollapsedSelection(false)
    }
  }, [editorId, focusedEditorId, selectionExpanded, setWaitForCollapsedSelection])

  return {
    hidden: !open,
    props: {
      style: floating.style,
    },
    ref: floating.refs.setFloating,
  }
}
