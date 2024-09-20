import { cn } from '@udecode/cn'
import { findNodePath } from '@udecode/plate-common/react'
import { Copy, Trash2 } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { insertNodes, removeNodes, type TEditor, type TElement } from '@udecode/plate-common'
import { Path } from 'slate'

function onClickDuplicate({ editor, element }: { editor: TEditor; element: TElement }): void {
  if (!editor || !element) return

  const path = findNodePath(editor, element)
  if (!path) return

  const clonedElement = JSON.parse(JSON.stringify(element))

  insertNodes(editor, clonedElement, {
    at: Path.next(path),
  })
}

function onClickDelete({ editor, element }: { editor: TEditor; element: TElement }): void {
  if (!editor || !element) return

  const path = findNodePath(editor, element)

  if (path) removeNodes(editor, { at: path })
}

function Link({
  children,
  className,
  onClick,
}: {
  children: any
  className?: string
  onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}) {
  return (
    <a
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'flex h-full w-full cursor-pointer justify-start gap-2 px-2 py-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      {children}
    </a>
  )
}

export function RowActions({ editor, element }: { editor: TEditor; element: TElement }) {
  return (
    <div className="flex w-full flex-col gap-1 px-1">
      <Link onClick={() => onClickDuplicate({ editor, element })}>
        <Copy className="size-4" />
        Duplicate
      </Link>
      <Link onClick={() => onClickDelete({ editor, element })} className="hover:bg-red-100">
        <Trash2 className="size-4" />
        Delete
      </Link>
    </div>
  )
}
