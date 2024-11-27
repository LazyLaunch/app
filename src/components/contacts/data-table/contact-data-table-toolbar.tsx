import { FileText, Monitor, Server, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SegmentForm } from '@/components/contacts/data-table/segment-form'
import { DataTableAdvancedFilter } from '@/components/data-table/data-table-advanced-filter'
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'

import { Form, FormField } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import type { Table } from '@tanstack/react-table'

import { CONTACT_DEFAULT_SEARCH_FIELD, CONTACT_GLOBAL_SEARCH_FIELDS, CSRF_TOKEN } from '@/constants'
import { ContactSourceEnum, ContactTabFilterEnum, CustomFieldTypeEnum } from '@/enums'
import { formatCamelCaseToTitle } from '@/lib/utils'

export interface ContactDataTableToolbarProps {
  table: Table<ContactProps>
  customFields: CustomFieldProps[]
  contactFields: ContactFields[]
  csrfToken: string
  ids: {
    projectId: string
    teamId: string
  }
  activeTab: ContactTabFilterEnum.QUICK_SEARCH | ContactTabFilterEnum.ADVANCED_FILTER
}

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
  contactFields,
  ids,
  activeTab,
}: ContactDataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0
  const globalFilter = table.getState().globalFilter
  const isGlobalFiltered = globalFilter.length > 0
  const searchForm = useForm<FormValues>({
    values: {
      csrfToken,
      field: isGlobalFiltered ? globalFilter[0].id : CONTACT_DEFAULT_SEARCH_FIELD,
      q: isGlobalFiltered ? globalFilter[0].value : '',
    },
  })

  function onSearchSubmit({ field, q }: FormValues) {
    const customField = customFields.find((f) => f.id === field)
    const value = [{ id: customField?.id || field, value: q }]
    table.setGlobalFilter(value)
    table.doFilter({ globalFilter: value })
  }

  const filterColumns = useMemo(() => {
    const filterCustomFields = customFields
      .filter((f) => [CustomFieldTypeEnum.BOOLEAN, CustomFieldTypeEnum.DATE].includes(f.type))
      .map((f) => ({
        id: f.id,
        tag: f.tag,
        name: f.name,
        type: f.type,
        options: f.type === CustomFieldTypeEnum.BOOLEAN ? booleanOptions : undefined,
      }))

    return [
      {
        id: 'source',
        tag: 'source',
        name: 'Source',
        type: CustomFieldTypeEnum.ENUM,
        options: sourceOptions,
      },
      {
        id: 'subscribed',
        tag: 'subscribed',
        name: 'Subscribed',
        type: CustomFieldTypeEnum.BOOLEAN,
        options: booleanOptions,
      },
      {
        id: 'updatedAt',
        tag: 'updatedAt',
        name: 'Updated At',
        type: CustomFieldTypeEnum.DATE,
        options: [],
      },
      {
        id: 'createdAt',
        tag: 'createdAt',
        name: 'Created At',
        type: CustomFieldTypeEnum.DATE,
        options: [],
      },
      ...filterCustomFields,
    ]
  }, [customFields])

  return (
    <Tabs
      onValueChange={(val) =>
        table.setTab(
          val as ContactTabFilterEnum.QUICK_SEARCH | ContactTabFilterEnum.ADVANCED_FILTER
        )
      }
      defaultValue={activeTab}
    >
      <div className="flex justify-between w-full">
        <div className="w-[400px]">
          <TabsList className="h-9 p-0.5">
            <TabsTrigger value={ContactTabFilterEnum.QUICK_SEARCH}>Quick Search</TabsTrigger>
            <TabsTrigger value={ContactTabFilterEnum.ADVANCED_FILTER}>Advanced Filter</TabsTrigger>
          </TabsList>
        </div>
        <div>
          <DataTableViewOptions table={table} customFields={customFields} />
        </div>
      </div>
      <TabsContent value={ContactTabFilterEnum.QUICK_SEARCH} className="mt-4">
        <div className="flex items-center justify-between space-x-2 z-10 bg-muted/0">
          <div className="flex flex-wrap space-x-2 flex-1 -ml-2 -mt-2">
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
                    <Input
                      {...field}
                      placeholder="Search by any text field..."
                      className="h-8 w-96"
                    />
                  )}
                />
                <FormField
                  control={searchForm.control}
                  name="field"
                  render={({ field }) => (
                    <Select
                      defaultValue={CONTACT_DEFAULT_SEARCH_FIELD}
                      value={field.value}
                      name={field.name}
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (searchForm.getValues('q')) {
                          const values = { ...searchForm.getValues(), field: val }
                          onSearchSubmit(values)
                        }
                      }}
                    >
                      <SelectTrigger className="hover:bg-accent h-8 absolute w-24 rounded-l-none focus:ring-0 right-0">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CONTACT_DEFAULT_SEARCH_FIELD}>Any</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Contact columns</SelectLabel>
                          {CONTACT_GLOBAL_SEARCH_FIELDS.map((fieldId) => (
                            <SelectItem key={fieldId} value={fieldId}>
                              {formatCamelCaseToTitle(fieldId)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Custom columns</SelectLabel>
                          {customFields
                            .filter((f) =>
                              [CustomFieldTypeEnum.STRING, CustomFieldTypeEnum.NUMBER].includes(
                                f.type
                              )
                            )
                            .map((customField) => (
                              <SelectItem key={customField.id} value={customField.id}>
                                {customField.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </form>
            </Form>
            {filterColumns.map(({ id, tag, name, options, type }) => {
              if (table.getColumn(id)) {
                return (
                  <DataTableFacetedFilter
                    className="mt-2"
                    table={table}
                    key={tag}
                    type={type}
                    column={table.getColumn(id)}
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
                  searchForm.reset({
                    csrfToken,
                    field: CONTACT_DEFAULT_SEARCH_FIELD,
                    q: '',
                  })
                  table.resetColumnFilters()
                  table.resetGlobalFilter()
                  table.doFilter({
                    globalFilter: [],
                    columnFilters: [],
                  })
                }}
                className="h-8 px-2 lg:px-3 mt-2"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent value={ContactTabFilterEnum.ADVANCED_FILTER} className="mt-4">
        <div className="flex space-x-2">
          <SegmentForm table={table} csrfToken={csrfToken} ids={ids} />
          <DataTableAdvancedFilter
            table={table}
            ids={ids}
            csrfToken={csrfToken}
            contactFields={contactFields}
            customFields={customFields}
          />
          {table.getSegment(table.getState().segmentId) && (
            <Button
              variant="ghost"
              onClick={() => {
                table.setSegmentId('')
                table.setFilterConditions([])
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
