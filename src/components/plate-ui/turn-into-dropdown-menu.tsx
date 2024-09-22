import { cn } from '@udecode/cn'
import {
  collapseSelection,
  getNodeEntries,
  isBlock,
  ParagraphPlugin,
  type TEditor,
} from '@udecode/plate-common'
import { focusEditor, useEditorSelector, type PlateEditor } from '@udecode/plate-common/react'
import { HEADING_KEYS } from '@udecode/plate-heading'
import { Check, Heading1, Heading2, Heading3, Text } from 'lucide-react'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectCustomItem,
  SelectGroup,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const items = [
  {
    description: 'Text',
    icon: Text,
    label: 'Text',
    value: ParagraphPlugin.key,
  },
  {
    description: 'Heading 1',
    icon: Heading1,
    label: 'Heading 1',
    value: HEADING_KEYS.h1,
  },
  {
    description: 'Heading 2',
    icon: Heading2,
    label: 'Heading 2',
    value: HEADING_KEYS.h2,
  },
  {
    description: 'Heading 3',
    icon: Heading3,
    label: 'Heading 3',
    value: HEADING_KEYS.h3,
  },
  // {
  //   value: 'ul',
  //   label: 'Bulleted list',
  //   description: 'Bulleted list',
  //   icon: Icons.ul,
  // },
  // {
  //   value: 'ol',
  //   label: 'Numbered list',
  //   description: 'Numbered list',
  //   icon: Icons.ol,
  // },
]

const defaultItem = items.find((item) => item.value === ParagraphPlugin.key)!

export function TurnIntoDropdownMenu({ editor }: { editor: TEditor }) {
  const [open, setOpen] = useState(false)

  const value: string = useEditorSelector((editor) => {
    let initialNodeType: string = ParagraphPlugin.key
    let allNodesMatchInitialNodeType = false
    const codeBlockEntries = getNodeEntries(editor, {
      match: (n) => isBlock(editor, n),
      mode: 'highest',
    })
    const nodes = Array.from(codeBlockEntries)

    if (nodes.length > 0) {
      initialNodeType = nodes[0][0].type as string
      allNodesMatchInitialNodeType = nodes.every(([node]) => {
        const type: string = (node?.type as string) || ParagraphPlugin.key

        return type === initialNodeType
      })
    }

    return allNodesMatchInitialNodeType ? initialNodeType : ParagraphPlugin.key
  }, [])
  const selectedItem = items.find((item) => item.value === value) ?? defaultItem
  const { icon: SelectedItemIcon } = selectedItem

  return (
    <Select
      open={open}
      onValueChange={(type) => {
        ;(editor as PlateEditor).tf.toggle.block({ type })
        collapseSelection(editor)
        focusEditor(editor)
      }}
      value={value}
      defaultValue={value}
    >
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'iconXs' }),
                'h-full w-full border-0 px-2 py-1 transition-none aria-[expanded=true]:bg-accent'
              )}
              iconClassName="size-3 opacity-100"
              onClick={() => setOpen((prevState) => !prevState)}
            >
              <SelectValue asChild>
                <SelectedItemIcon className="mr-1 size-4" />
              </SelectValue>
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="top">Turn into</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <SelectContent align="start">
        <SelectGroup className="flex flex-col gap-0.5">
          <SelectLabel className="px-2 font-semibold text-foreground">Turn into</SelectLabel>
          <SelectSeparator />
          {items.map(({ icon: Icon, label, value }) => (
            <SelectCustomItem
              key={value}
              value={value}
              className="relative flex w-full cursor-pointer select-none items-center justify-between gap-6 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <SelectItemText asChild>
                <>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span className="text-sm font-light">{label}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <SelectItemIndicator className="size-3">
                      <Check className="size-3" />
                    </SelectItemIndicator>
                  </div>
                </>
              </SelectItemText>
            </SelectCustomItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
