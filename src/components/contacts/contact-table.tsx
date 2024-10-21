import { useStore } from '@nanostores/react'

import { contactDataTableColumns } from '@/components/contacts/data-table/contact-data-table-columns'
import { ContactDataTableToolbar } from '@/components/contacts/data-table/contact-data-table-toolbar'
import { DataTable } from '@/components/data-table'

import { $contacts, $deleteContact } from '@/stores/contacts-store'

import type { ContactProps } from '@/db/models/contact'
import type { Table } from '@tanstack/react-table'

export function ContactTable<TData>({
  data,
  className,
  csrfToken,
}: {
  data: ContactProps[]
  className: string
  csrfToken: string
}) {
  const $data = useStore($contacts)

  return (
    <DataTable<ContactProps, any>
      data={$data ?? data}
      columns={contactDataTableColumns({ csrfToken })}
      className={className}
      onDelete={$deleteContact}
    >
      {({ table }: { table: Table<TData> }) => <ContactDataTableToolbar table={table} />}
    </DataTable>
  )
}
