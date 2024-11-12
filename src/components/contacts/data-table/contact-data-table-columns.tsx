import { UTCDate } from '@date-fns/utc'
import type { ColumnDef } from '@tanstack/react-table'

import { Checkbox } from '@/components/ui/checkbox'

import { ContactDataTableRowActions } from '@/components/contacts/data-table/contact-data-table-row-actions'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import type { ContactCustomFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import { CustomFieldTypeEnum, DATE_TEXT_FORMAT } from '@/types'
import type { Column, Row } from '@tanstack/react-table'
import { format } from 'date-fns'

export function contactDataTableColumns({
  csrfToken,
  customFields,
  ids,
}: {
  csrfToken: string
  customFields: CustomFieldProps[]
  ids: {
    teamId: string
    projectId: string
  }
}): ColumnDef<ContactProps>[] {
  const newFields = customFields.map((field) => {
    return {
      accessorKey: field.tag,
      header: ({ column }: { column: Column<ContactProps> }) => (
        <DataTableColumnHeader column={column} title={field.name} />
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
              {format(new UTCDate(Number.parseInt(value)), DATE_TEXT_FORMAT)}
            </div>
          )
        }
        if (type === CustomFieldTypeEnum.NUMBER) {
          return <div>{Number.parseInt(value)}</div>
        }

        if (type === CustomFieldTypeEnum.BOOLEAN) {
          const toBool = ['true', true].includes(value)
          const label = toBool ? 'Yes' : 'No'

          return (
            <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
              {label}
            </div>
          )
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    ...newFields,
    {
      accessorKey: 'firstName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'source',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => <div>{row.getValue('source')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'subscribed',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subscribed" />,
      cell: ({ row }) => {
        const isSubscribed = row.getValue('subscribed')
        const label = isSubscribed ? 'Yes' : 'No'

        return (
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            {label}
          </div>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
      cell: ({ row }) => (
        <div className="w-40">
          {format(new UTCDate(row.getValue('updatedAt')), DATE_TEXT_FORMAT)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ row }) => (
        <div className="w-40">
          {format(new UTCDate(row.getValue('createdAt')), DATE_TEXT_FORMAT)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row, table }) => (
        <ContactDataTableRowActions
          customFields={customFields}
          ids={ids}
          row={row}
          table={table}
          csrfToken={csrfToken}
        />
      ),
    },
  ]
}
