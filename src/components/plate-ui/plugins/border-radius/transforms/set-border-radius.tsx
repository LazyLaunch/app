import {
  isBlock,
  setElements,
  unsetNodes,
  type SetNodesOptions,
  type SlateEditor,
  type TNodeMatch,
} from '@udecode/plate-common'

import { BaseBorderRadiusPlugin } from '../base-border-radius-plugin'

export function setBorderRadius<E extends SlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: {
    value: string
    setNodesOptions?: SetNodesOptions<E>
  }
) {
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(BaseBorderRadiusPlugin)
  const measure = editor.getOption(BaseBorderRadiusPlugin, 'measure')

  const match: TNodeMatch = (n) => {
    return isBlock(editor, n)
  }

  if (defaultNodeValue.includes(value)) {
    unsetNodes(editor, nodeKey!, {
      match,
      ...setNodesOptions,
    })
  } else {
    setElements(
      editor,
      {
        [nodeKey!]: `${value}${measure}`,
      },
      {
        match: match as any,
        ...setNodesOptions,
      }
    )
  }
}
