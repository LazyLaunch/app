import {
  BaseParagraphPlugin,
  createSlatePlugin,
  isBlock,
  setNodes,
  type SlateEditor,
} from '@udecode/plate-common'
import { Editor, nodes } from 'slate'

const extendEditor = (editor: SlateEditor) => {
  const { insertBreak } = editor

  editor.insertBreak = () => {
    insertBreak()

    const { selection } = editor
    if (selection) {
      const [newBlockPath] = nodes(editor as Editor, {
        match: (n) => isBlock(editor, n),
        mode: 'highest',
      })

      if (newBlockPath) {
        setNodes(editor, { lineHeight: undefined }, { at: newBlockPath[1] })
      }
    }
  }

  return editor
}

export const BaseLineHeightPlugin = createSlatePlugin({
  key: 'lineHeight',
  inject: {
    nodeProps: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    },
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.lineHeight) {
                node[editor.getType(plugin)] = element.style.lineHeight
              }
            },
          },
        },
      },
    }),
    targetPlugins: [BaseParagraphPlugin.key],
  },
  extendEditor: ({ editor }) => extendEditor(editor),
})
