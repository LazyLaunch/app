import { createSlatePlugin } from '@udecode/plate-common'

export const BaseBorderRadiusPlugin = createSlatePlugin({
  key: 'borderRadius',
  options: {
    measure: 'px' as string,
  },
  inject: {
    nodeProps: {
      defaultNodeValue: ['0', '0px', '0rem', '0em'],
      nodeKey: 'borderRadius',
    },
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            isElement: true,
            parse: ({ element, node }) => {
              const { borderRadius } = element.style

              if (borderRadius) node[editor.getType(plugin)] = borderRadius || '0'
            },
          },
        },
      },
    }),
  },
})
