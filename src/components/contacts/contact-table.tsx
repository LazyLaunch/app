import { contactDataTableColumns } from '@/components/contacts/data-table/contact-data-table-columns'
import { ContactDataTableToolbar } from '@/components/contacts/data-table/contact-data-table-toolbar'
import { DataTable, type TablePaginationState } from '@/components/data-table'
import type { ContactProps } from '@/db/models/contact'
import { actions } from 'astro:actions'

import type { Table } from '@tanstack/react-table'

export function ContactTable({
  data,
  className,
  csrfToken,
  total,
  ids,
  pagination,
}: {
  data: ContactProps[]
  className: string
  csrfToken: string
  total: number
  ids?: Record<string, string>
  pagination: TablePaginationState
}) {
  return (
    <DataTable<ContactProps, any>
      data={data}
      columns={contactDataTableColumns<ContactProps>({ csrfToken })}
      className={className}
      total={total}
      ids={ids}
      csrfToken={csrfToken}
      pagination={pagination}
      reqFilter={actions.contact.filters}
    >
      {({ table }: { table: Table<ContactProps> }) => <ContactDataTableToolbar table={table} />}
    </DataTable>
  )
}
