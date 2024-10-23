import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { ContactDataTableRowActions } from '@/components/contacts/data-table/contact-data-table-row-actions'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

export function contactDataTableColumns<TData>({
  csrfToken,
}: {
  csrfToken: string
}): ColumnDef<TData>[] {
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
      accessorKey: 'teamId',
      header: ({ column }) => <DataTableColumnHeader<TData, any> column={column} title="Team Id" />,
      cell: ({ row }) => <div>{row.getValue('teamId')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'projectId',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Project Id" />
      ),
      cell: ({ row }) => <div>{row.getValue('projectId')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Updated At" />
      ),
      cell: ({ row }) => <div>{row.getValue('updatedAt')}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader<TData, any> column={column} title="Created At" />
      ),
      cell: ({ row }) => <div>{row.getValue('createdAt')}</div>,
      enableSorting: true,
      enableHiding: true,
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
        <ContactDataTableRowActions<TData> row={row} table={table} csrfToken={csrfToken} />
      ),
    },
  ]
}
