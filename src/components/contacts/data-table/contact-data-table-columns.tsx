import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { ContactDataTableRowActions } from '@/components/contacts/data-table/contact-data-table-row-actions'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import type { ContactCustomFields } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import { CustomFieldTypeEnum, TABLE_DATE_TEXT_FORMAT } from '@/types'
import type { Column, Row } from '@tanstack/react-table'
import { format } from 'date-fns'

export function contactDataTableColumns<TData>({
  csrfToken,
  customFields,
}: {
  csrfToken: string
  customFields: CustomFieldProps[]
}): ColumnDef<TData>[] {
  const newFields = customFields.map((field) => {
    return {
      accessorKey: field.tag,
      header: ({ column }: { column: Column<TData> }) => (
        <DataTableColumnHeader<TData, any> column={column} title={field.name} />
      ),
      cell: ({ row }: { row: Row<any> }) => {
        const fields = row.original.customFields
        if (!fields) return
        const parsed: ContactCustomFields[] = JSON.parse(
          fields as unknown as string
        ) as ContactCustomFields[]
        const entry = parsed.find((entry) => entry.tag === field.tag)
        const { type, value } = entry || {}
        if (!value) return

        if (type === CustomFieldTypeEnum.DATE) {
          return (
            <div className="w-40">
              {format(new Date(Number.parseInt(value)), TABLE_DATE_TEXT_FORMAT)}
            </div>
          )
        }
        if (type === CustomFieldTypeEnum.NUMBER) {
          return <div>{Number.parseInt(value)}</div>
        }
        return <div>{value}</div>
      },
      enableSorting: true,
      enableHiding: true,
    }
  })

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      size: 32,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader<TData, any> column={column} title="Email" />,
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    ...newFields,
    {
      accessorKey: 'firstName',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="First Name" />
      ),
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Last Name" />
      ),
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'source',
      header: ({ column }) => <DataTableColumnHeader<TData, any> column={column} title="Source" />,
      cell: ({ row }) => <div>{row.getValue('source')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'subscribed',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Subscribed" />
      ),
      cell: ({ row }) => {
        const isSubscribed = row.getValue('subscribed')
        const label = isSubscribed ? 'Yes' : 'No'

        return <Badge variant={isSubscribed ? 'default' : 'destructive'}>{label}</Badge>
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Updated At" />
      ),
      cell: ({ row }) => (
        <div className="w-40">{format(row.getValue('updatedAt'), TABLE_DATE_TEXT_FORMAT)}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <div className="w-40">{format(row.getValue('createdAt'), TABLE_DATE_TEXT_FORMAT)}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row, table }) => (
        <ContactDataTableRowActions<TData> row={row} table={table} csrfToken={csrfToken} />
      ),
    },
  ]
}
