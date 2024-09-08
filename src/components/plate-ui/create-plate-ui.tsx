import { withProps } from '@udecode/cn'
import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react'
import { PlateLeaf } from '@udecode/plate-common/react'

import { type NodeComponent } from '@udecode/plate-common/react'

export function createPlateUI() {
  let components: Record<string, NodeComponent> = {
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
  }

  return components
}
