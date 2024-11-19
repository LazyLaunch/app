import { actions } from 'astro:actions'
import { NuqsAdapter } from 'nuqs/adapters/react'

import { contactDataTableColumns } from '@/components/contacts/data-table/contact-data-table-columns'
import { DataTable } from '@/components/data-table'

import type { SearchParamProps } from '@/components/data-table'
import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

export function ContactTable({
  data,
  className,
  csrfToken,
  total,
  ids,
  customFields,
  contactFields,
  searchParams,
}: {
  data: ContactProps[]
  className: string
  csrfToken: string
  total: number
  ids: {
    teamId: string
    projectId: string
  }
  customFields: CustomFieldProps[]
  contactFields: ContactFields[]
  searchParams: SearchParamProps
}) {
  return (
    <NuqsAdapter>
      <DataTable
        data={data}
        columns={contactDataTableColumns({ csrfToken, customFields, ids })}
        className={className}
        total={total}
        ids={ids}
        csrfToken={csrfToken}
        reqFilter={actions.contact.filters}
        customFields={customFields}
        contactFields={contactFields}
        searchParams={searchParams}
      />
    </NuqsAdapter>
  )
}
