import { contactDataTableColumns } from '@/components/contacts/data-table/contact-data-table-columns'
import {
  ContactDataTableToolbar,
  type ContactDataTableToolbarProps,
} from '@/components/contacts/data-table/contact-data-table-toolbar'
import { DataTable, type TablePaginationState } from '@/components/data-table'
import type { ContactProps } from '@/db/models/contact'
import { actions } from 'astro:actions'

import type { CustomFieldProps } from '@/db/models/custom-field'

export function ContactTable({
  data,
  className,
  csrfToken,
  total,
  ids,
  pagination,
  customFields,
}: {
  data: ContactProps[]
  className: string
  csrfToken: string
  total: number
  ids?: Record<string, string>
  pagination: TablePaginationState
  customFields: CustomFieldProps[]
}) {
  return (
    <DataTable<ContactProps, any>
      data={data}
      columns={contactDataTableColumns<ContactProps>({ csrfToken, customFields })}
      className={className}
      total={total}
      ids={ids}
      csrfToken={csrfToken}
      pagination={pagination}
      reqFilter={actions.contact.filters}
      customFields={customFields}
    >
      {({ table, customFields, csrfToken }: ContactDataTableToolbarProps<ContactProps>) => (
        <ContactDataTableToolbar table={table} customFields={customFields} csrfToken={csrfToken} />
      )}
    </DataTable>
  )
}
