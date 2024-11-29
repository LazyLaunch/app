import { actions } from 'astro:actions'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { GroupForm } from '@/components/groups/group-form'
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'

import { CSRF_TOKEN } from '@/constants'

import type { SelectGroup } from '@/db/schema'
import type { Row, RowSelectionState, Table } from '@tanstack/react-table'

interface RowActionsProps {
  row: Row<SelectGroup>
  table: Table<SelectGroup>
  [CSRF_TOKEN]: string
  setRowSelection: (state: RowSelectionState) => void
  rowSelection: Record<string, boolean>
  ids: {
    projectId: string
    teamId: string
  }
}

interface DeleteFormValues {
  id: string
  [CSRF_TOKEN]: string
  projectId: string
  teamId: string
}

export function GroupRowActions({
  row,
  table,
  csrfToken,
  rowSelection,
  setRowSelection,
  ids,
}: RowActionsProps) {
  const rowId = row.original.id
  const deleteForm = useForm<DeleteFormValues>({
    defaultValues: {
      [CSRF_TOKEN]: csrfToken,
      ...ids,
      id: rowId,
    },
  })

  async function onDelete({ id, ...values }: DeleteFormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('ids', JSON.stringify([id]))
    await actions.group.deleteBulk(formData)
    table.options.meta!.onDeleteGroups?.(({ data, setData }) =>
      setData(data.filter((row) => row.id !== id))
    )
    delete rowSelection[id]
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
          <Dialog>
            <DropdownMenuItem asChild>
              <>
                <DialogTrigger className="relative flex w-full cursor-pointer select-none items-center space-x-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <Pencil className="size-4" />
                  <span>Edit</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <GroupForm ids={ids} csrfToken={csrfToken} row={row} />
                </DialogContent>
              </>
            </DropdownMenuItem>
          </Dialog>
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
              <AlertDialogTitle>Confirm Deletion of Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this group? This action cannot be undone, and the
                group will be permanently removed.
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
