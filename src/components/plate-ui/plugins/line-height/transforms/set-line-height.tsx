import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeMatch,
  getKeyByType,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common'

import { BaseLineHeightPlugin } from '@/components/plate-ui/plugins/line-height/base-line-height-plugin'

export const setLineHeight = <E extends SlateEditor>(
  editor: E,
  { setNodesOptions, value }: { value: number; setNodesOptions?: SetNodesOptions<E> }
): void => {
  const {
    inject: { targetPlugins },
  } = editor.getPlugin(BaseLineHeightPlugin)
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(BaseLineHeightPlugin)

  const match: TNodeMatch = (n) =>
    isBlock(editor, n) &&
    !!targetPlugins &&
    targetPlugins.includes(getKeyByType(editor, n.type as string))

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey!, {
      match,
      ...setNodesOptions,
    })
  } else {
    setElements(
      editor,
      { [nodeKey!]: value },
      {
        match: match as any,
        ...setNodesOptions,
      }
    )
  }
}
