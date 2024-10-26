import { ArrowUpDown } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { setLineHeight } from '@/components/plate-ui/plugins/line-height'

import { Input } from '@/components/ui/input'
import { handleFloatInput } from '@/lib/utils'
import type { SlateEditor, TEditor, TElement } from '@udecode/plate-common'

const MIN_VALUE: number = 1.5 as const
const MAX_VALUE: number = 3 as const

function updateLineHeight({
  e,
  editor,
  valRef,
}: {
  e: React.ChangeEvent<HTMLInputElement>
  editor: TEditor
  valRef: React.MutableRefObject<string | null>
}) {
  const value = handleFloatInput(e.target.value, {
    max: MAX_VALUE,
    min: MIN_VALUE,
  })
  e.target.value = value
  valRef.current = value

  setLineHeight(editor as SlateEditor, { value: Number.parseFloat(value) })
}

function handleFocus(inputRef: React.RefObject<HTMLInputElement>) {
  inputRef.current?.select()
}

export function LineHeightInput({ editor, element }: { editor: TEditor; element: TElement }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const valRef = useRef<string | null>(null)
  const currentLineHeight = (element.lineHeight || MIN_VALUE) as string

  useEffect(() => {
    return () => {
      if (valRef.current && valRef.current !== currentLineHeight) {
        setLineHeight(editor as SlateEditor, { value: Number.parseFloat(valRef.current) })
      }
    }
  }, [])

  return (
    <div className="group relative">
      <ArrowUpDown strokeWidth={1.5} className="absolute left-1 top-1 size-4 text-foreground" />
      <Input
        ref={inputRef}
        onFocus={(e) => {
          handleFocus(inputRef)
          updateLineHeight({ e, editor, valRef })
        }}
        onBlur={(e) => updateLineHeight({ e, editor, valRef })}
        onChange={(e) => {
          const value = handleFloatInput(e.target.value, {
            max: MAX_VALUE,
            min: MIN_VALUE,
            skipMin: true,
          })
          e.target.value = value
          if (Number.parseFloat(value) >= MIN_VALUE) {
            valRef.current = value
            setLineHeight(editor as SlateEditor, { value: Number.parseFloat(value) })
          }
        }}
        defaultValue={currentLineHeight}
        className="h-6 w-12 rounded-md border-transparent bg-background pl-5 pr-0 text-base group-hover:border-input"
      />
    </div>
  )
}
