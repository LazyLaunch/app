import { withProps } from '@udecode/cn'
import { HEADING_KEYS } from '@udecode/plate-heading'

import { type NodeComponent } from '@udecode/plate-common/react'

const HeadingElement = (props) => {
  console.log(props)
  return <h1>Hello</h1>
}

export function createPlateUI({
  draggable,
  placeholder,
}: { draggable?: boolean; placeholder?: boolean } = {}) {
  let components: Record<string, NodeComponent> = {
    [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
  }

  return components
}
