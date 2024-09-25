import { FontSizeSvg } from '@/components/svg/font-size'
import { Input } from '@/components/ui/input'

import { handleNumberInput } from '@/lib/utils'
import { getMark, select, setMarks, type TEditor } from '@udecode/plate-common'
import { useEditorSelector } from '@udecode/plate-common/react'
import { useCallback } from 'react'

const TEXT_MIN_SIZE: number = 12 as const

function updateSize({
  e,
  setSize,
}: {
  e: React.FocusEvent<HTMLInputElement>
  setSize: (value: number) => void
}) {
  const value = handleNumberInput(e.target.value, { max: 90, min: TEXT_MIN_SIZE })
  e.target.value = value
  setSize(parseInt(value))
}

export function FontSizeInput({ editor, nodeType }: { editor: TEditor; nodeType: string }) {
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

  return (
    <div className="group relative">
      <FontSizeSvg className="absolute left-2 top-[2.5px] size-[19px] text-foreground" />
      <Input
        onFocus={(e) => updateSize({ e, setSize })}
        onBlur={(e) => updateSize({ e, setSize })}
        onChange={(e) => {
          const value = handleNumberInput(e.target.value, { max: 90 })
          e.target.value = value
          if (parseInt(value) >= TEXT_MIN_SIZE) {
            setSize(parseInt(value))
          }
        }}
        defaultValue={(selectionDefined && currentSize) || TEXT_MIN_SIZE}
        className="h-6 w-[54px] rounded-md border-transparent bg-background pl-7 pr-0 text-base group-hover:border-input"
      />
    </div>
  )
}
