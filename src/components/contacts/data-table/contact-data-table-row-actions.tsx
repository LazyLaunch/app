import { actions } from 'astro:actions'
import { Ellipsis, PencilLine, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import type { Row, Table } from '@tanstack/react-table'

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'

import {
  type OnSubmitSingleContactFormProps,
  SingleContactForm,
} from '@/components/contacts/forms/single-contact-form'

import type { ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import { CSRF_TOKEN, CustomFieldTypeEnum } from '@/types'
import { useState } from 'react'

const SINGLE_FORM_TITLE: string = 'Edit Contact Information' as const
const SINGLE_FORM_DESC: string =
  "Update the contact's information below. You can modify any field and save your changes to keep the contact details current." as const

function getCustomFieldsForm(row: Row<ContactProps>): Record<string, string | boolean | number> {
  const data: (CustomFieldProps & { value: string | boolean | number })[] = JSON.parse(
    row.original.customFields as unknown as string
  ) as (CustomFieldProps & { value: string | boolean | number })[]

  const fields: Record<string, string | boolean | number> = {}
  for (const field of data) {
    if (field.type === CustomFieldTypeEnum.BOOLEAN) fields[field.id] = field.value === 'true'
    if (field.type === CustomFieldTypeEnum.NUMBER) fields[field.id] = Number(field.value) ?? ''
    if (field.type === CustomFieldTypeEnum.DATE) fields[field.id] = Number(field.value) ?? ''
    if (field.type === CustomFieldTypeEnum.STRING) fields[field.id] = field.value ?? ''
  }

  return fields
}

async function onSubmitSingleContactForm({ values, dirtyFields }: OnSubmitSingleContactFormProps) {
  const { customFields, id, projectId, teamId, csrfToken, ...rest } = values
  const dirtyFieldNames: string[] = Object.keys(dirtyFields)
  const dirtyCustomFieldNames: string[] = Object.keys(dirtyFields?.customFields || {})

  if (dirtyFieldNames.length === 0 && dirtyCustomFieldNames.length === 0) return

  const customFieldData: Record<string, string | boolean | number> = {}

  for (const customFieldId of dirtyCustomFieldNames) {
    const val = customFields[customFieldId]
    customFieldData[customFieldId] = val
  }

  const formData = new FormData()
  formData.append('id', id!)
  formData.append('projectId', projectId)
  formData.append(CSRF_TOKEN, csrfToken)

  for (const [key, value] of Object.entries(rest)) {
    dirtyFieldNames.includes(key) && formData.append(key, String(value ?? ''))
  }
  dirtyCustomFieldNames.length > 0 &&
    formData.append('customFields', JSON.stringify(customFieldData))
  return await actions.contact.update(formData)
}

interface ContactDataTableRowActionsProps {
  row: Row<ContactProps>
  table: Table<ContactProps>
  [CSRF_TOKEN]: string
  ids: {
    teamId: string
    projectId: string
  }
  customFields: CustomFieldProps[]
}

interface DeleteFormValues {
  id: string
  [CSRF_TOKEN]: string
}

export function ContactDataTableRowActions({
  row,
  table,
  csrfToken,
  customFields,
  ids,
}: ContactDataTableRowActionsProps) {
  const [openSingleContactForm, setOpenSingleContactForm] = useState<boolean>(false)

  const deleteForm = useForm<DeleteFormValues>({
    defaultValues: {
      [CSRF_TOKEN]: csrfToken,
      id: row.original.id,
    },
  })

  async function onDelete(values: DeleteFormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    await actions.contact.delete(formData)
    table.options.meta!.onDelete?.(values.id)
  }

  const singleFormDefaultValues = {
    id: row.original.id,
    email: row.original.email,
    firstName: row.original.firstName || '',
    lastName: row.original.lastName || '',
    csrfToken,
    customFields: getCustomFieldsForm(row),
    ...ids,
  }

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
              <Ellipsis className="size-4" />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => setOpenSingleContactForm((prevState) => !prevState)}
              className="cursor-pointer space-x-2"
            >
              <PencilLine className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
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
                <AlertDialogTitle>Confirm Deletion of contact</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the selected contact? This action is permanent and
                  will remove all associated data from your contacts.
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
      <SingleContactForm
        title={SINGLE_FORM_TITLE}
        desc={SINGLE_FORM_DESC}
        btnName="Update Contact"
        customFields={customFields}
        open={openSingleContactForm}
        setOpen={setOpenSingleContactForm}
        defaultValues={singleFormDefaultValues}
        onSubmit={onSubmitSingleContactForm}
      />
    </>
  )
}
