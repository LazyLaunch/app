import { FontSizeSvg } from '@/components/svg/font-size'
import { Input } from '@/components/ui/input'

import { handleNumberInput } from '@/lib/utils'
import { getMark, select, setMarks, type TEditor } from '@udecode/plate-common'
import { useEditorSelector } from '@udecode/plate-common/react'
import { useCallback, useEffect, useRef } from 'react'

const TEXT_MIN_SIZE: number = 12 as const
const TEXT_MAX_SIZE: number = 64 as const

function updateSize({
  e,
  setSize,
  valRef,
}: {
  e: React.FocusEvent<HTMLInputElement>
  setSize: (value: number) => void
  valRef: React.MutableRefObject<string | null>
}) {
  const value = handleNumberInput(e.target.value, { max: TEXT_MAX_SIZE, min: TEXT_MIN_SIZE })
  e.target.value = value
  valRef.current = value
  setSize(parseInt(value))
}

function handleFocus(inputRef: React.RefObject<HTMLInputElement>) {
  inputRef.current?.select()
}

export function FontSizeInput({ editor, nodeType }: { editor: TEditor; nodeType: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const valRef = useRef<string | null>(null)
  const selectionDefined = useEditorSelector((editor) => !!editor.selection, [])
  const currentSize = useEditorSelector((editor) => getMark(editor, nodeType) as string, [nodeType])

  const setSize = useCallback(
    (value: number) => {
      if (editor.selection && parseInt(currentSize) !== value) {
        select(editor, editor.selection)
        setMarks(editor, { [nodeType]: value })
      }
    },
    [editor, nodeType]
  )

  useEffect(() => {
    return () => {
      if (valRef.current && valRef.current !== currentSize) {
        setSize(parseInt(valRef.current))
      }
    }
  }, [])

  return (
    <div className="group relative">
      <FontSizeSvg className="absolute left-2 top-[2.5px] size-[19px] text-foreground" />
      <Input
        ref={inputRef}
        onFocus={(e) => {
          handleFocus(inputRef)
          updateSize({ e, setSize, valRef })
        }}
        onBlur={(e) => updateSize({ e, setSize, valRef })}
        onChange={(e) => {
          const value = handleNumberInput(e.target.value, { max: TEXT_MAX_SIZE })
          e.target.value = value
          if (parseInt(value) >= TEXT_MIN_SIZE) {
            valRef.current = value
            setSize(parseInt(value))
          }
        }}
        defaultValue={(selectionDefined && currentSize) || TEXT_MIN_SIZE}
        className="h-6 w-[54px] rounded-md border-transparent bg-background pl-7 pr-0 text-base group-hover:border-input"
      />
    </div>
  )
}
