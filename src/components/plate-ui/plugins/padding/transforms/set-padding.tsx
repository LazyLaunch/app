import {
  isBlock,
  setElements,
  unsetNodes,
  type SetNodesOptions,
  type SlateEditor,
  type TNodeMatch,
} from '@udecode/plate-common'

import { BasePaddingPlugin } from '@/components/plate-ui/plugins/padding'

export function setPadding<E extends SlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: {
    value: string
    setNodesOptions?: SetNodesOptions<E>
  }
) {
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(BasePaddingPlugin)
  const measure = editor.getOption(BasePaddingPlugin, 'measure')

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
        [nodeKey!]: value
          .split(' ')
          .map((val) => `${val}${measure}`)
          .join(' '),
      },
      {
        match: match as any,
        ...setNodesOptions,
      }
    )
  }
}
