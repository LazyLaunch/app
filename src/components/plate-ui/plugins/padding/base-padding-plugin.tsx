import { createSlatePlugin, type PluginConfig, type SlatePlugin } from '@udecode/plate-common'

import type { PaddingPluginOptions } from '@/components/plate-ui/plugins/padding'

export const BasePaddingPlugin: SlatePlugin<PluginConfig<'padding', PaddingPluginOptions>> =
  createSlatePlugin({
    key: 'padding',
    options: {
      measure: 'px',
      isAllSides: undefined,
    },
    transforms: {},
    api: {},
    inject: {
      nodeProps: {
        defaultNodeValue: [
          '0',
          '0px',
          '0rem',
          '0em',
          '0 0 0 0',
          '0px 0px 0px 0px',
          '0rem 0rem 0rem 0rem',
          '0em 0em 0em 0em',
          '0 0',
          '0px 0px',
          '0rem 0rem',
          '0em 0em',
        ],
        nodeKey: 'padding',
      },
      targetPluginToInject: ({ editor, plugin }) => ({
        parsers: {
          html: {
            deserializer: {
              isElement: true,
              parse: ({ element, node }) => {
                const { padding } = element.style

                if (padding) node[editor.getType(plugin)] = padding || '0'
              },
            },
          },
        },
      }),
    },
  }) as SlatePlugin<PluginConfig<'padding', PaddingPluginOptions>>
