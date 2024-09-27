import { withProps } from '@udecode/cn'
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import { ParagraphPlugin, PlateLeaf } from '@udecode/plate-common/react'
import { HEADING_KEYS } from '@udecode/plate-heading'
import { BaseSlashInputPlugin } from '@udecode/plate-slash-command'

import { type NodeComponent } from '@udecode/plate-common/react'

import { CodeLeaf } from '@/components/plate-ui/code-leaf'
import { HeadingElement } from '@/components/plate-ui/heading-element'
import { ParagraphElement } from '@/components/plate-ui/paragraph-element'
import { SlashInputElement } from '@/components/plate-ui/slash-input-element'
import { withDraggables } from '@/components/plate-ui/with-draggables'

export function createPlateUI() {
  let components: Record<string, NodeComponent> = {
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
    [CodePlugin.key]: CodeLeaf,
    [ParagraphPlugin.key]: withProps(ParagraphElement, { as: 'p' }),
    [BaseSlashInputPlugin.key]: SlashInputElement,
    [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
    [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
    [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
  }

  // components = withPlaceholders(components)
  components = withDraggables(components)

  return components
}
