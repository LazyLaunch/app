import { handleKeyDown, handleNumberInput } from '@/lib/utils'
import type { TEditor, TElement } from '@udecode/plate-common'
import type { PlateEditor } from '@udecode/plate-common/react'
import { useState } from 'react'

import { setBorderRadius } from '@/components/plate-ui/plugins/border-radius'

export function RowBorderRadius({ editor, element }: { editor: TEditor; element: TElement }) {
  const [elementValue] = `${element.borderRadius || '0'}`.match(/\d+/g) as string[]
  const [borderRadius, setBorderRadiusInput] = useState<string>(elementValue)

  return (
    <div className="relative flex cursor-pointer space-x-1 space-y-0 rounded-md border border-white">
      <div className="size-4 overflow-hidden transition-all duration-300 ease-in-out">
        <div
          style={{
            borderTopLeftRadius: `${borderRadius}px`,
          }}
          className="size-5 border border-muted-foreground transition-colors"
        ></div>
      </div>
      <input
        value={borderRadius}
        className="h-4 w-6 self-center rounded-none border-0 bg-background p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        onChange={(e) => {
          const value = handleNumberInput(e.target.value, { max: 20 })
          setBorderRadiusInput(`${value}`)
          setBorderRadius(editor as PlateEditor, { value: `${value}` })
        }}
        onKeyDown={handleKeyDown}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        pattern="\d*"
      />
    </div>
  )
}
