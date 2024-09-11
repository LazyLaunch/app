import React from 'react'

import type { PlateContentProps } from '@udecode/plate-common/react'

import { PlateContent } from '@udecode/plate-common/react'

export type EditorProps = PlateContentProps

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ disabled, readOnly, style, ...props }, ref) => {
    return (
      <div className="relative w-full" ref={ref}>
        <PlateContent
          aria-disabled={disabled}
          className="relative min-h-20 w-full whitespace-pre-wrap break-words outline-0 transition-all duration-300 ease-in-out placeholder:text-muted-foreground"
          style={style}
          data-plate-selectable
          disableDefaultStyles
          readOnly={disabled ?? readOnly}
          {...props}
        />
      </div>
    )
  }
)
Editor.displayName = 'Editor'

export { Editor }
