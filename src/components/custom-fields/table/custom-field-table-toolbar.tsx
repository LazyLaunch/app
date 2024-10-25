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

import type { CustomFieldList } from '@/db/models/custom-field'
import { CSRF_TOKEN } from '@/types'

interface Props {
  csrfToken: string
  ids: string[]
  setRowSelection: (state: RowSelectionState) => void
  table: Table<CustomFieldList>
}

interface DeleteFormValues {
  csrfToken: string
  ids: string[]
}

export function CustomFieldTableToolbar({ csrfToken, ids, setRowSelection, table }: Props) {
  const deleteAllForm = useForm<DeleteFormValues>({
    values: {
      ids,
      csrfToken,
    },
    defaultValues: {
      ids: [],
    },
  })

  async function onDeleteSubmit(values: DeleteFormValues) {
    const formData = new FormData()
    formData.append(CSRF_TOKEN, values.csrfToken)
    formData.append('ids', JSON.stringify(values.ids))

    await actions.customField.deleteBulk(formData)
    table.options.meta!.onDelete?.(({ data, setData }) =>
      setData(data.filter((row) => !values.ids.includes((row as unknown as { id: string }).id)))
    )
    setRowSelection({})
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter fields..."
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
                    <AlertDialogTitle>Confirm Deletion of Custom Field(s)</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the selected custom field(s)? This action is
                      permanent and will remove all associated data from your contacts.
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
