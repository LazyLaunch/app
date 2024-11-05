import type { Table } from '@tanstack/react-table'
import { FileText, Monitor, Server, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
import { ContactSourceEnum, CSRF_TOKEN, CustomFieldTypeEnum } from '@/types'

import { Form, FormField } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'

export interface ContactDataTableToolbarProps {
  table: Table<ContactProps>
  customFields: CustomFieldProps[]
  csrfToken: string
}

const DEFAULT_SEARCH_FIELD: string = 'any' as const

const booleanOptions = [
  {
    label: 'Yes',
    value: true,
    icon: ToggleRight,
  },
  {
    label: 'No',
    value: false,
    icon: ToggleLeft,
  },
]

const sourceOptions = [
  {
    label: 'App',
    value: ContactSourceEnum.APP,
    icon: Monitor,
  },
  {
    label: 'Api',
    value: ContactSourceEnum.API,
    icon: Server,
  },
  {
    label: 'Form',
    value: ContactSourceEnum.FORM,
    icon: FileText,
  },
]

interface FormValues {
  csrfToken: string
  field: string
  q: string
}

export function ContactDataTableToolbar({
  table,
  customFields,
  csrfToken,
}: ContactDataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0
  const isGlobalFiltered = table.getState().globalFilter.length > 0
  const searchForm = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      field: DEFAULT_SEARCH_FIELD,
      q: '',
    },
  })

  function onSearchSubmit({ field, q }: FormValues) {
    const customField = customFields.find((f) => f.tag === field)
    table.setGlobalFilter([
      { field, id: customField?.id, value: q, isCustomField: Boolean(customField) },
    ])
  }

  const filterColumns = useMemo(() => {
    const filterCustomFields = customFields
      .filter((f) => [CustomFieldTypeEnum.BOOLEAN, CustomFieldTypeEnum.DATE].includes(f.type))
      .map((f) => ({
        tag: f.tag,
        name: f.name,
        type: f.type,
        options: f.type === CustomFieldTypeEnum.BOOLEAN ? booleanOptions : undefined,
      }))

    return [
      { tag: 'source', name: 'Source', type: CustomFieldTypeEnum.ENUM, options: sourceOptions },
      {
        tag: 'subscribed',
        name: 'Subscribed',
        type: CustomFieldTypeEnum.BOOLEAN,
        options: booleanOptions,
      },
      { tag: 'updatedAt', name: 'Updated At', type: CustomFieldTypeEnum.DATE, options: [] },
      { tag: 'createdAt', name: 'Created At', type: CustomFieldTypeEnum.DATE, options: [] },
      ...filterCustomFields,
    ]
  }, [customFields])

  return (
    <div className="flex items-center justify-between z-10 bg-muted/0">
      <div className="flex flex-wrap items-center space-x-2 flex-1 -ml-2 -mt-2">
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit(onSearchSubmit)}
            className="ml-2 flex relative mt-2"
          >
            <input
              {...searchForm.register(CSRF_TOKEN, { required: true })}
              type="hidden"
              name={CSRF_TOKEN}
              value={csrfToken}
            />
            <FormField
              control={searchForm.control}
              name="q"
              render={({ field }) => (
                <Input {...field} placeholder="Search by any text field..." className="h-8 w-96" />
              )}
            />
            <FormField
              control={searchForm.control}
              name="field"
              render={({ field }) => (
                <Select
                  defaultValue={DEFAULT_SEARCH_FIELD}
                  value={field.value}
                  name={field.name}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="hover:bg-accent h-8 absolute w-24 rounded-l-none focus:ring-0 right-0">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_SEARCH_FIELD}>Any</SelectItem>
                    {customFields
                      .filter((f) =>
                        [CustomFieldTypeEnum.STRING, CustomFieldTypeEnum.NUMBER].includes(f.type)
                      )
                      .map((customField) => (
                        <SelectItem key={customField.tag} value={customField.tag}>
                          {customField.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </form>
        </Form>
        {filterColumns.map(({ tag, name, options, type }) => {
          if (table.getColumn(tag)) {
            return (
              <DataTableFacetedFilter
                className="mt-2"
                key={tag}
                type={type}
                column={table.getColumn(tag)}
                title={name}
                options={options}
              />
            )
          }
        })}
        {(isFiltered || isGlobalFiltered) && (
          <Button
            variant="ghost"
            onClick={() => {
              searchForm.reset()
              table.resetColumnFilters()
              table.resetGlobalFilter()
            }}
            className="h-8 px-2 lg:px-3 mt-2"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions className="w-40 self-start" table={table} customFields={customFields} />
    </div>
  )
}
