import { actions } from 'astro:actions'
import { Ellipsis } from 'lucide-react'
import { useForm } from 'react-hook-form'

import type { Row, Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { CSRF_TOKEN } from '@/types'

interface ContactDataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
  [CSRF_TOKEN]: string
}

interface DeleteFormValues {
  id: string
  [CSRF_TOKEN]: string
}

export function ContactDataTableRowActions<TData>({
  row,
  table,
  csrfToken,
}: ContactDataTableRowActionsProps<TData>) {
  const deleteForm = useForm<DeleteFormValues>({
    defaultValues: {
      [CSRF_TOKEN]: csrfToken,
      id: (row.original as unknown as { id: string }).id,
    },
  })

  async function onDelete(values: DeleteFormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    await actions.contact.delete(formData)
    table.options.meta!.onDelete?.(values)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <Ellipsis className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Form {...deleteForm}>
            <form className="w-full" onSubmit={deleteForm.handleSubmit(onDelete)}>
              <button type="submit" className="flex w-full cursor-pointer">
                Delete
              </button>
            </form>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
