import { actions } from 'astro:actions'

import { contactsDataTableColumns } from '@/components/contacts/contacts-table/contacts-data-table-columns'
import { DataTable } from '@/components/contacts/data-table'

import type { SearchParamProps } from '@/components/contacts/data-table'
import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import type { FilterCondition } from '@/db/models/filter'
import type { SelectFilter } from '@/db/schema'

export function ContactTable({
  data,
  className,
  csrfToken,
  total,
  ids,
  customFields,
  contactFields,
  searchParams,
  filters,
  filterConditions,
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
  filters: SelectFilter[]
  filterConditions: FilterCondition[]
}) {
  return (
    <DataTable
      data={data}
      columns={contactsDataTableColumns({ csrfToken, customFields, ids })}
      className={className}
      total={total}
      ids={ids}
      csrfToken={csrfToken}
      reqFilter={actions.contact.filters}
      customFields={customFields}
      contactFields={contactFields}
      searchParams={searchParams}
      filters={filters}
      filterConditions={filterConditions}
    />
  )
}
