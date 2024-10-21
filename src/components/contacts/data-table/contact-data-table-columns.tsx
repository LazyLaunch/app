import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { ContactDataTableRowActions } from '@/components/contacts/data-table/contact-data-table-row-actions'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import type { ContactProps } from '@/db/models/contact'

export function contactDataTableColumns({
  csrfToken,
}: {
  csrfToken: string
}): ColumnDef<ContactProps>[] {
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('email')}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'firstName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="First name" />,
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('firstName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last name" />,
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('lastName')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'subscribed',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subscribed" />,
      cell: ({ row }) => {
        const label = row.getValue('subscribed') ? 'Yes' : 'No'

        return (
          <Badge variant={row.getValue('subscribed') ? 'default' : 'destructive'}>{label}</Badge>
        )
      },
    },
    // {
    //   accessorKey: 'status',
    //   header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    //   cell: ({ row }) => {
    //     const status = statuses.find((status) => status.value === row.getValue('status'))

    //     if (!status) {
    //       return null
    //     }

    //     return (
    //       <div className="flex w-[100px] items-center">
    //         {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
    //         <span>{status.label}</span>
    //       </div>
    //     )
    //   },
    //   filterFn: (row, id, value) => {
    //     return value.includes(row.getValue(id))
    //   },
    // },
    // {
    //   accessorKey: 'priority',
    //   header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    //   cell: ({ row }) => {
    //     const priority = priorities.find((priority) => priority.value === row.getValue('priority'))

    //     if (!priority) {
    //       return null
    //     }

    //     return (
    //       <div className="flex items-center">
    //         {priority.icon && <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
    //         <span>{priority.label}</span>
    //       </div>
    //     )
    //   },
    //   filterFn: (row, id, value) => {
    //     return value.includes(row.getValue(id))
    //   },
    // },
    {
      id: 'actions',
      cell: ({ row, table }) => (
        <ContactDataTableRowActions<ContactProps> row={row} table={table} csrfToken={csrfToken} />
      ),
    },
  ]
}
