import { actions } from 'astro:actions'

import { contactDataTableColumns } from '@/components/contacts/data-table/contact-data-table-columns'
import {
  ContactDataTableToolbar,
  type ContactDataTableToolbarProps,
} from '@/components/contacts/data-table/contact-data-table-toolbar'
import { DataTable, type TablePaginationState } from '@/components/data-table'

import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

export function ContactTable({
  data,
  className,
  csrfToken,
  total,
  ids,
  pagination,
  customFields,
  contactFields,
}: {
  data: ContactProps[]
  className: string
  csrfToken: string
  total: number
  ids: {
    teamId: string
    projectId: string
  }
  pagination: TablePaginationState
  customFields: CustomFieldProps[]
  contactFields: ContactFields[]
}) {
  return (
    <DataTable
      data={data}
      columns={contactDataTableColumns({ csrfToken, customFields, ids })}
      className={className}
      total={total}
      ids={ids}
      csrfToken={csrfToken}
      pagination={pagination}
      reqFilter={actions.contact.filters}
      customFields={customFields}
      contactFields={contactFields}
    >
      {(props: ContactDataTableToolbarProps) => <ContactDataTableToolbar {...props} />}
    </DataTable>
  )
}
