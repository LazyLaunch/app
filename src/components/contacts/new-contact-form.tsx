import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { CSRF_TOKEN } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { IndividualContactsForm } from '@/components/contacts/forms/individual-contacts-form'
import { SingleContactForm } from '@/components/contacts/forms/single-contact-form'

import type { CustomFieldProps } from '@/db/models/custom-field'

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
        csrfToken={csrfToken}
        teamId={teamId}
        projectId={projectId}
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
