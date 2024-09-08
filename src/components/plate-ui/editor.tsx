import React from 'react'

import type { PlateContentProps } from '@udecode/plate-common/react'

import { PlateContent } from '@udecode/plate-common/react'

export type EditorProps = PlateContentProps

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, readOnly, style, ...props }, ref) => {
    return (
      <div className="relative w-full" ref={ref}>
        <PlateContent
          aria-disabled={disabled}
          className={className}
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
