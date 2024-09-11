import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
  useComboboxStore,
  useStoreState,
} from '@ariakit/react'
import { cn, withRef } from '@udecode/cn'
import { findNodePath, PlateElement } from '@udecode/plate-common/react'
import { HEADING_KEYS } from '@udecode/plate-heading'
import React, { useDeferredValue, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Heading1, Heading2, Heading3 } from 'lucide-react'

import { groupByField } from '@/lib/group-by-field'

import { useComboboxInput, useHTMLInputCursorState } from '@udecode/plate-combobox/react'
import { createPointRef, getPointBefore, insertText, moveSelection } from '@udecode/plate-common'
import type { PlateEditor } from '@udecode/plate-common/react'
import type { ComponentType, SVGProps } from 'react'
import type { PointRef } from 'slate'

interface SlashCommandRule {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  onSelect: (editor: PlateEditor) => void
  text: string
  keywords?: string[]
  type?: string
  isSeparator?: boolean
}

const rules: SlashCommandRule[] = [
  {
    type: 'Text',
    icon: Heading1,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h1 })
    },
    text: 'Heading 1',
  },
  {
    type: 'Text',
    icon: Heading2,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h2 })
    },
    text: 'Heading 2',
  },
  {
    type: 'Text',
    icon: Heading3,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h3 })
    },
    text: 'Heading 3',
  },
]

export const TRIGGER: string = '/' as const
const DEFAULT_TRIGGERS: string[] = [TRIGGER] as const

function getTriggerOffset(value: string, triggers = DEFAULT_TRIGGERS): number {
  for (let i = value.length - 1; i >= 0; i--) {
    const char = value[i]
    if (char && triggers.includes(char)) {
      return i
    }
  }
  return -1
}

function getTrigger(value: string, triggers = DEFAULT_TRIGGERS): string | null {
  const previousChar = value[value.length - 1]
  if (!previousChar) return null

  const secondPreviousChar = value[value.length - 2]
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar)
  if (!isIsolated) return null

  if (triggers.includes(previousChar)) return previousChar
  return null
}

function getSearchValue(value: string, triggers = DEFAULT_TRIGGERS): string {
  const offset = getTriggerOffset(value, triggers)
  if (offset === -1) return ''

  return value.slice(offset + 1)
}

function getMatches(deferredSearchValue: string): SlashCommandRule[] {
  const filtered = rules.filter((rule) =>
    rule.text.toLowerCase().includes(deferredSearchValue.toLowerCase())
  )
  const matches = filtered.sort((a, b) => {
    const indexA = a.text.toLowerCase().indexOf(deferredSearchValue.toLowerCase())
    const indexB = b.text.toLowerCase().indexOf(deferredSearchValue.toLowerCase())
    return indexA - indexB
  })
  return matches
}

export const SlashInputElement = withRef<typeof PlateElement>(({ className, ...props }, ref) => {
  const { children, editor, element } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorState = useHTMLInputCursorState(inputRef)

  const [value, setValue] = useState('')

  const combobox = useComboboxStore()
  const searchValue = useStoreState(combobox, 'value')
  const deferredSearchValue = useDeferredValue(searchValue)
  const matches = getMatches(deferredSearchValue)
  const groupedItems = Object.entries(groupByField(matches, 'type'))
  const hasMatches = !!matches?.length

  useLayoutEffect(() => {
    combobox.setOpen(hasMatches)
  }, [combobox, hasMatches])

  const [insertPoint, setInsertPoint] = useState<PointRef | null>(null)

  useEffect(() => {
    const path = findNodePath(editor, element)
    if (!path) return

    const point = getPointBefore(editor, path)
    if (!point) return

    const pointRef = createPointRef(editor, point)
    setInsertPoint(pointRef)

    return () => {
      pointRef.unref()
    }
  }, [editor, element])

  const {
    props: inputProps,
    removeInput,
    cancelInput,
  } = useComboboxInput({
    cursorState,
    cancelInputOnBlur: false,
    onCancelInput: (cause) => {
      if (!['manual', 'backspace'].includes(cause)) {
        insertText(editor, TRIGGER + value, {
          at: insertPoint?.current ?? undefined,
        })
      }
      if (cause === 'arrowLeft' || cause === 'arrowRight') {
        moveSelection(editor, {
          distance: 1,
          reverse: cause === 'arrowLeft',
        })
      }
    },
    ref: inputRef,
  })

  useEffect(combobox.render, [combobox, value])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const targetValue = `/${target.value}`
    const triggerValue = getTrigger(targetValue)
    const searchValue = getSearchValue(targetValue)
    const anyMatches = !!getMatches(searchValue).length

    if (triggerValue) {
      combobox.show()
    } else if (!anyMatches) {
      insertText(editor, targetValue, {
        at: insertPoint?.current ?? undefined,
      })
      cancelInput('manual', true)
    } else if (!searchValue) {
      combobox.hide()
    }

    setValue(target.value)
    combobox.setValue(searchValue)
  }

  return (
    <PlateElement as="span" data-slate-value={element.value} ref={ref} {...props}>
      <span contentEditable={false}>
        <ComboboxProvider store={combobox}>
          {TRIGGER}

          <span className="relative min-h-[1lh]">
            <span>{value || '\u200B'}</span>

            <Combobox
              autoFocus
              autoSelect="always"
              setValueOnChange={false}
              showOnClick={false}
              showOnChange={false}
              showOnKeyPress={false}
              className={cn(
                'absolute left-0 top-0 size-full bg-transparent outline-none',
                className
              )}
              onChange={onChange}
              ref={inputRef}
              value={value}
              {...inputProps}
            />
          </span>

          <Portal>
            <ComboboxPopover
              hidden={!hasMatches}
              unmountOnHide
              fitViewport
              className={cn(
                'mt-2.5 flex h-full w-full flex-col overflow-hidden rounded-lg border bg-popover shadow-md md:min-w-[450px]',
                className
              )}
            >
              {groupedItems.map(([type, items], i) => (
                <ComboboxGroup
                  key={type}
                  className={cn(
                    'overflow-hidden p-1 text-foreground',
                    i < groupedItems.length - 1 && 'border-b'
                  )}
                >
                  {type && (
                    <ComboboxGroupLabel
                      className={cn(
                        'px-2 py-1.5 text-xs font-medium text-muted-foreground',
                        className
                      )}
                    >
                      {type}
                    </ComboboxGroupLabel>
                  )}
                  {items.map(({ icon: Icon, onSelect, text }, itemIndex) => (
                    <ComboboxItem
                      key={text + itemIndex}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground',
                        className
                      )}
                      onClick={() => {
                        removeInput(true)
                        onSelect?.(editor)
                      }}
                      focusOnHover
                      value={text}
                    >
                      <Icon aria-hidden className="mr-2 size-4" />
                      {text}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ))}
            </ComboboxPopover>
          </Portal>
        </ComboboxProvider>
      </span>

      {children}
    </PlateElement>
  )
})
