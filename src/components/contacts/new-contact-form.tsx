import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { CSRF_TOKEN, CustomFieldTypeEnum } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { IndividualContactsForm } from '@/components/contacts/forms/individual-contacts-form'
import {
  SingleContactForm,
  type OnSubmitSingleContactFormProps,
} from '@/components/contacts/forms/single-contact-form'

import type { CustomFieldProps } from '@/db/models/custom-field'
import { actions } from 'astro:actions'

function getCustomFieldsForm(data: CustomFieldProps[]): Record<string, string | boolean | number> {
  const fields: Record<string, string | boolean | number> = {}
  for (const field of data) {
    if (field.type === CustomFieldTypeEnum.BOOLEAN) fields[field.id] = false
    if (field.type === CustomFieldTypeEnum.DATE) fields[field.id] = ''
    if (field.type === CustomFieldTypeEnum.NUMBER) fields[field.id] = ''
    if (field.type === CustomFieldTypeEnum.STRING) fields[field.id] = ''
  }

  return fields
}

async function onSubmitSingleContactForm({ values }: OnSubmitSingleContactFormProps) {
  const { customFields, ...data } = values
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value?.toString() || '')
  }
  formData.append('customFields', JSON.stringify(customFields))
  return await actions.contact.create(formData)
}

interface FormValues {
  [CSRF_TOKEN]: string
  email: string
  firstName: string
  lastName: string
  teamId: string
  projectId: string
}

interface Props extends Pick<FormValues, 'csrfToken' | 'teamId' | 'projectId'> {
  customFields: CustomFieldProps[]
}

export function NewContactForm({ csrfToken, teamId, projectId, customFields }: Props) {
  const [openSingleContactForm, setOpenSingleContactForm] = useState<boolean>(false)
  const [openIndividualContactsForm, setOpenIndividualContactsForm] = useState<boolean>(false)

  const singleFormDefaultValues = {
    email: '',
    firstName: '',
    lastName: '',
    csrfToken,
    customFields: getCustomFieldsForm(customFields),
    teamId,
    projectId,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setOpenSingleContactForm((prevState) => !prevState)}
          className="cursor-pointer"
        >
          Single Contact
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setOpenIndividualContactsForm((prevState) => !prevState)}
          className="cursor-pointer"
        >
          Individual Contacts
        </DropdownMenuItem>
      </DropdownMenuContent>
      <SingleContactForm
        customFields={customFields}
        open={openSingleContactForm}
        setOpen={setOpenSingleContactForm}
        defaultValues={singleFormDefaultValues}
        onSubmit={onSubmitSingleContactForm}
      />
      <IndividualContactsForm
        teamId={teamId}
        projectId={projectId}
        csrfToken={csrfToken}
        open={openIndividualContactsForm}
        setOpen={setOpenIndividualContactsForm}
      />
    </DropdownMenu>
  )
}
