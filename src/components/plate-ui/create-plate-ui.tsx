import { withProps } from '@udecode/cn'
import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react'
import { ParagraphPlugin, PlateLeaf } from '@udecode/plate-common/react'

import { type NodeComponent } from '@udecode/plate-common/react'

import { ParagraphElement } from '@/components/plate-ui/paragraph-element'
import { withDraggables } from '@/components/plate-ui/with-draggables'

export function createPlateUI() {
  let components: Record<string, NodeComponent> = {
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [ParagraphPlugin.key]: ParagraphElement,
  }

  components = withDraggables(components)

  return components
}
