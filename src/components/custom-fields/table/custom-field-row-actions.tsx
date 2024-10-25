import { actions } from 'astro:actions'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import type { Row, RowSelectionState, Table } from '@tanstack/react-table'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { CSRF_TOKEN } from '@/types'

interface RowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
  [CSRF_TOKEN]: string
  setRowSelection: (state: RowSelectionState) => void
  rowSelection: Record<string, boolean>
}

interface DeleteFormValues {
  id: string
  [CSRF_TOKEN]: string
}

export function CustomFieldRowActions<TData>({
  row,
  table,
  csrfToken,
  rowSelection,
  setRowSelection,
}: RowActionsProps<TData>) {
  const deleteForm = useForm<DeleteFormValues>({
    defaultValues: {
      [CSRF_TOKEN]: csrfToken,
      id: (row.original as unknown as { id: string }).id,
    },
  })

  async function onDelete(values: DeleteFormValues) {
    const formData = new FormData()
    formData.append(CSRF_TOKEN, values.csrfToken)
    formData.append('ids', JSON.stringify([values.id]))
    await actions.customField.deleteBulk(formData)
    table.options.meta!.onDelete?.(({ data, setData }) =>
      setData(data.filter((row) => (row as unknown as { id: string }).id !== values.id))
    )
    delete rowSelection[values.id]
    setRowSelection(rowSelection)
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <Ellipsis className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="space-x-2">
            <Pencil className="size-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <AlertDialogTrigger className="flex w-full cursor-pointer space-x-2 focus:bg-red-100">
              <Trash2 className="size-4" />
              <span>Delete</span>
            </AlertDialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <Form {...deleteForm}>
          <form className="flex flex-col gap-4" onSubmit={deleteForm.handleSubmit(onDelete)}>
            <input
              {...deleteForm.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={csrfToken}
            />
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion of Custom Field</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the selected custom field? This action is permanent
                and will remove all associated data from your contacts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" type="submit">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
