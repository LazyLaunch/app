import type { RowSelectionState, Table } from '@tanstack/react-table'
import { actions } from 'astro:actions'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

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
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { CSRF_TOKEN } from '@/constants'
import type { SelectFilter } from '@/db/schema'

interface Props {
  csrfToken: string
  ids: string[]
  teamId: string
  projectId: string
  setRowSelection: (state: RowSelectionState) => void
  table: Table<SelectFilter>
}

interface DeleteFormValues {
  csrfToken: string
  ids: string[]
  teamId: string
  projectId: string
}

export function SegmentsTableToolbar({
  csrfToken,
  ids,
  setRowSelection,
  teamId,
  projectId,
  table,
}: Props) {
  const deleteAllForm = useForm<DeleteFormValues>({
    values: {
      ids,
      csrfToken,
      teamId,
      projectId,
    },
    defaultValues: {
      ids: [],
    },
  })

  async function onDeleteSubmit({ ids, ...values }: DeleteFormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('ids', JSON.stringify(ids))

    await actions.filter.deleteBulk(formData)
    table.options.meta!.onDeleteSegments?.(({ data, setData }) =>
      setData(data.filter((row) => !ids.includes(row.id)))
    )
    setRowSelection({})
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter segments..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {ids.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="space-x-2" variant="destructive" size="sm">
                <Trash2 className="size-4" />
                <span>Delete ({ids.length})</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <Form {...deleteAllForm}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={deleteAllForm.handleSubmit(onDeleteSubmit)}
                >
                  <input
                    {...deleteAllForm.register(CSRF_TOKEN, { required: true })}
                    type="hidden"
                    name={CSRF_TOKEN}
                    value={csrfToken}
                  />
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion of Segment(s)</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the selected segment(s)? This action cannot be
                      undone, and all selected segments will be permanently removed.
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
        )}
      </div>
    </div>
  )
}
