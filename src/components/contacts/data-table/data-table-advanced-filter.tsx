import { Plus, PlusIcon, Settings, Trash2, X } from 'lucide-react'
import { useRef } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { BooleanField } from '@/components/contacts/data-table/advanced-filter/boolean-field'
import { DateField } from '@/components/contacts/data-table/advanced-filter/date-field'
import { NumberField } from '@/components/contacts/data-table/advanced-filter/number-field'
import { SubmitForm } from '@/components/contacts/data-table/advanced-filter/submit-form'
import { TextField } from '@/components/contacts/data-table/advanced-filter/text-field'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import {
  CONDITION_TYPES,
  CSRF_TOKEN,
  DEFAULT_FILTER,
  OPERATOR_NAMES,
  OPERATORS_BY_COL_TYPE,
} from '@/constants'

import { ConditionTypeEnum, CustomFieldTypeEnum, OperatorEnum } from '@/enums'
import { cn, formatFieldName } from '@/lib/utils'

import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import type { FilterCondition, FilterConditionColumnType } from '@/db/models/filter'
import type { Table } from '@tanstack/react-table'

interface FilterConditionData extends Omit<FilterCondition, 'columnType'> {
  columnType: FilterConditionColumnType
}

export interface FormValues {
  csrfToken: string
  projectId: string
  teamId: string
  filterConditions: FilterConditionData[]
}

interface Props {
  csrfToken: string
  contactFields: ContactFields[]
  customFields: CustomFieldProps[]
  table: Table<ContactProps>
  ids: {
    projectId: string
    teamId: string
  }
}

function getColumn({
  contactFields,
  customFields,
  id,
}: {
  id: string
  contactFields: ContactFields[]
  customFields: CustomFieldProps[]
}): ContactFields | CustomFieldProps | undefined {
  const contactField = contactFields.find((col) => col.name === id)
  const customField = customFields.find((col) => col.id === id)
  return contactField || customField
}

export function DataTableAdvancedFilter({
  csrfToken,
  contactFields,
  customFields,
  table,
  ids,
}: Props) {
  const deleteFilterConditionIdsRef = useRef<string[]>([])

  const defaultCondition: FilterConditionData = {
    filterId: table.getState().segmentId || undefined,
    columnName: contactFields.find((f) => f.type === CustomFieldTypeEnum.STRING)?.name || '',
    columnType: CustomFieldTypeEnum.STRING,
    operator: OperatorEnum.CONTAINS,
    value: '',
    secondaryValue: '',
    conditionType: ConditionTypeEnum.AND,
  }
  const conditions = table.getState().filterConditions
  const form = useForm<FormValues>({
    values: {
      csrfToken,
      ...ids,
      filterConditions: conditions,
    },
  })
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'filterConditions',
    shouldUnregister: true,
    keyName: 'uuid',
    rules: {
      minLength: {
        value: 1,
        message: 'At least one filter is required. Please add a filter to proceed.',
      },
      maxLength: {
        value: 50,
        message: 'Maximum of 50 filters allowed. Please remove some filters to add new ones.',
      },
    },
  })
  const errors = new Map<string, any | undefined>(
    Object.entries(form.formState.errors?.filterConditions ?? {})
  )

  async function handleSubmit({ filterConditions }: FormValues) {
    table.doSubmitFilterConditions({ filterConditions })
  }

  const label =
    conditions.length > 0 ? (
      <>
        <Settings className="size-4" />
        Edit Filter
      </>
    ) : (
      <>
        <Plus className="size-4" />
        Add Filter
      </>
    )

  return (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
        {label}
        {conditions.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {conditions.length} added
            </Badge>
          </>
        )}
      </SheetTrigger>
      <SheetContent
        withOverlay={false}
        className="sm:max-w-[893px] space-y-6 h-full overflow-y-scroll"
      >
        <SheetHeader>
          <SheetTitle>Advanced Filter Options</SheetTitle>
          <SheetDescription>
            Apply advanced filters to refine your search. To customize your query, select a field,
            specify conditions, and enter values.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <input
            {...form.register(CSRF_TOKEN, { required: true })}
            type="hidden"
            name={CSRF_TOKEN}
            value={csrfToken}
          />
          <div className="space-y-2">
            {fields.map((f, index) => {
              const watchColumnName = form.watch(`filterConditions.${index}.columnName`)
              const column = getColumn({
                contactFields,
                customFields,
                id: watchColumnName,
              })
              const _field = fields[index]

              return (
                <div key={f.uuid} className="flex space-x-2">
                  <Controller
                    control={form.control}
                    name={`filterConditions.${index}.conditionType`}
                    rules={{
                      required: index > 0,
                    }}
                    render={({ field }) => {
                      if (index > 0)
                        return (
                          <Select
                            name={field.name}
                            value={String(field.value ?? '')}
                            onValueChange={(val) =>
                              update(index, { ..._field, conditionType: Number(val) })
                            }
                          >
                            <SelectTrigger className="w-24 flex-none">
                              <SelectValue placeholder="Condition">
                                {CONDITION_TYPES[Number(field.value) as ConditionTypeEnum]}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(CONDITION_TYPES).map((index) => (
                                <SelectItem key={index} value={index}>
                                  {CONDITION_TYPES[Number(index) as ConditionTypeEnum]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )

                      return (
                        <div className="w-24 flex-none flex items-center flex-col self-center">
                          Where
                        </div>
                      )
                    }}
                  />
                  <Controller
                    control={form.control}
                    name={`filterConditions.${index}.columnName`}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={String(field.value ?? '')}
                        onValueChange={(val) => {
                          const col = getColumn({
                            contactFields,
                            customFields,
                            id: val,
                          })
                          const defaultOperator =
                            DEFAULT_FILTER[col?.type as FilterConditionColumnType]
                          const columnType =
                            (col?.type as FilterConditionColumnType) ?? CustomFieldTypeEnum.STRING

                          update(index, {
                            ..._field,
                            columnName: val,
                            operator: defaultOperator,
                            columnType,
                            value: '',
                            secondaryValue: '',
                          })
                        }}
                      >
                        <SelectTrigger autoFocus className="w-32 flex-none">
                          <SelectValue placeholder="Field name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Contact Fields</SelectLabel>
                            {contactFields.map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {formatFieldName(col.name)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Custom Fields</SelectLabel>
                            {customFields.map((col) => (
                              <SelectItem key={col.id} value={col.id}>
                                {col.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`filterConditions.${index}.operator`}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => {
                      return (
                        <Select
                          name={field.name}
                          value={String(field.value ?? '')}
                          disabled={!column}
                          onValueChange={(val) => {
                            update(index, {
                              ..._field,
                              operator: Number(val),
                              value: '',
                              secondaryValue: '',
                            })
                          }}
                        >
                          <SelectTrigger className="w-32 flex-none">
                            <SelectValue placeholder="Operator">
                              {OPERATOR_NAMES[Number(field.value) as OperatorEnum]}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {column &&
                              OPERATORS_BY_COL_TYPE[column.type as CustomFieldTypeEnum].map(
                                (index) => (
                                  <SelectItem key={index} value={String(index)}>
                                    {OPERATOR_NAMES[Number(index) as OperatorEnum]}
                                  </SelectItem>
                                )
                              )}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  <TextField
                    form={form}
                    type={column?.type}
                    index={index}
                    className="grow"
                    placeholder={`Enter text to filter by ${formatFieldName(column?.name)}`}
                  />
                  <NumberField
                    form={form}
                    type={column?.type}
                    index={index}
                    className="grow"
                    placeholder={`Enter a number to filter by ${formatFieldName(column?.name)}`}
                  />
                  <DateField
                    form={form}
                    type={column?.type}
                    index={index}
                    className="grow flex space-x-2"
                    placeholder={`Select a date to filter by ${formatFieldName(column?.name)}`}
                  />
                  <BooleanField type={column?.type} className="grow" />
                  <Button
                    className="w-10 flex-none"
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      form.unregister(`filterConditions.${index}.value`)
                      form.unregister(`filterConditions.${index}.secondaryValue`)
                      if (_field.id) {
                        const ids = deleteFilterConditionIdsRef.current
                        ids.push(_field.id)
                        deleteFilterConditionIdsRef.current = ids
                      }
                      remove(index)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                type="button"
                className="gap-2 w-24"
                onClick={() => append(defaultCondition, { shouldFocus: false })}
              >
                <PlusIcon />
                Add
              </Button>
              <p className="text-destructive text-sm">{errors.get('root')?.message}</p>
            </div>
          </div>
          <SheetFooter>
            {fields.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="space-x-2"
                onClick={async () => {
                  const filterConditions = form.getValues().filterConditions
                  await handleSubmit({ ...form.getValues(), filterConditions: [] })
                  for (const condition of filterConditions) {
                    if (condition.id) {
                      const ids = deleteFilterConditionIdsRef.current
                      ids.push(condition.id)
                      deleteFilterConditionIdsRef.current = ids
                    }
                  }
                  table.setFilterConditions([])
                  form.resetField('filterConditions', { defaultValue: [] })
                }}
              >
                <X />
                <span>Reset filters</span>
              </Button>
            )}
            {fields.length !== 0 && (
              <Button type="submit">Apply {fields.length > 0 && fields.length} filter(s)</Button>
            )}
          </SheetFooter>
        </form>
        <div className="flex items-center">
          <div className="h-px bg-muted-foreground w-full" />
          <div className="px-2 text-muted-foreground flex w-64 place-content-center">
            Segment It
          </div>
          <div className="h-px bg-muted-foreground w-full" />
        </div>
        <SubmitForm
          ids={ids}
          csrfToken={csrfToken}
          deleteFilterConditionIds={deleteFilterConditionIdsRef.current}
          filterForm={form}
          table={table}
        />
      </SheetContent>
    </Sheet>
  )
}
