import type { FC } from 'react'

import { BlockquotePlugin } from '@udecode/plate-block-quote/react'
import { ParagraphPlugin, createNodesWithHOC } from '@udecode/plate-common/react'
import {
  type WithDraggableOptions,
  withDraggable as withDraggablePrimitive,
} from '@udecode/plate-dnd'
import { HEADING_KEYS } from '@udecode/plate-heading'
import { BulletedListPlugin, NumberedListPlugin } from '@udecode/plate-list/react'
import { BaseImagePlugin, BaseMediaEmbedPlugin, BasePlaceholderPlugin } from '@udecode/plate-media'

import { Draggable, type DraggableProps } from '@/components/plate-ui/draggable'

export const withDraggable = (
  Component: FC,
  options?: WithDraggableOptions<Partial<Omit<DraggableProps, 'children' | 'editor' | 'element'>>>
) => withDraggablePrimitive<DraggableProps>(Draggable, Component, options as any)

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable)

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      keys: [ParagraphPlugin.key, BulletedListPlugin.key, NumberedListPlugin.key],
      level: 0,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: 'pt-1',
        },
      },
      key: HEADING_KEYS.h1,
    },
    {
      key: HEADING_KEYS.h2,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: 'pt-1',
        },
      },
      key: HEADING_KEYS.h3,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: 'pt-0.5',
          gutterLeft: '',
        },
      },
      keys: [ParagraphPlugin.key],
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: 'px-0 pb-0',
        },
      },
      keys: [BulletedListPlugin.key, NumberedListPlugin.key],
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: 'px-0 pb-0',
        },
      },
      key: BlockquotePlugin.key,
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-0 px-0 pb-0',
        },
      },
      key: BaseImagePlugin.key,
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-0 px-0 pb-0',
        },
      },
      key: BaseMediaEmbedPlugin.key,
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: 'p-0',
        },
      },
      key: BasePlaceholderPlugin.key,
    },
  ])
}
