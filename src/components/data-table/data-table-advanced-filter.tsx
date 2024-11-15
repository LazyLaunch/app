import { actions, isInputError } from 'astro:actions'
import { Plus, PlusIcon, Trash2, X } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { BooleanField } from '@/components/data-table/advanced-filter/boolean-field'
import { DateField } from '@/components/data-table/advanced-filter/date-field'
import { NumberField } from '@/components/data-table/advanced-filter/number-field'
import { SubmitForm } from '@/components/data-table/advanced-filter/submit-form'
import { TextField } from '@/components/data-table/advanced-filter/text-field'
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
import {
  Sheet,
  SheetClose,
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

import { ConditionType, CustomFieldTypeEnum, Operator } from '@/enums'
import { cn, formatFieldName } from '@/lib/utils'

import type { ContactFields, ContactProps } from '@/db/models/contact'
import type { CustomFieldProps } from '@/db/models/custom-field'
import type { FilterCondition } from '@/db/models/filter'
import type { Table } from '@tanstack/react-table'

interface FormValues {
  csrfToken: string
  projectId: string
  teamId: string
  filterConditions: (Omit<FilterCondition, 'operator'> & {
    columnType?: CustomFieldTypeEnum
    operator?: number | undefined
  })[]
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
  const form = useForm<FormValues>({
    defaultValues: {
      csrfToken,
      ...ids,
      filterConditions: [
        {
          columnName: contactFields.find((f) => f.type === CustomFieldTypeEnum.STRING)?.name,
          columnType: CustomFieldTypeEnum.STRING,
          operator: Operator.CONTAINS,
          value: '',
          secondaryValue: '',
          conditionType: ConditionType.AND,
        },
      ],
    },
  })
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'filterConditions',
    shouldUnregister: true,
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

  async function handleSubmit({ filterConditions, ...values }: FormValues) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    formData.append('filterConditions', JSON.stringify(filterConditions))

    const { error, data } = await actions.filter.contacts(formData)
    if (isInputError(error)) {
      const { issues } = error

      for (const issue of issues) {
        form.setError(issue.path.join('.') as keyof FormValues, { message: issue.message })
      }
      return
    }
    table.options.meta!.onApplyAdvancedFilter?.(data as ContactProps[])
  }

  return (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
        <Plus className="size-4" />
        Add Filter
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
                <div key={f.id} className="flex space-x-2">
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
                                {CONDITION_TYPES[Number(field.value) as ConditionType]}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(CONDITION_TYPES).map((index) => (
                                <SelectItem key={index} value={index}>
                                  {CONDITION_TYPES[Number(index) as ConditionType]}
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
                          const defaultOperator = DEFAULT_FILTER[col?.type as CustomFieldTypeEnum]
                          const columnType =
                            (col?.type as CustomFieldTypeEnum) ?? CustomFieldTypeEnum.STRING

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
                              {OPERATOR_NAMES[Number(field.value) as Operator]}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {column &&
                              OPERATORS_BY_COL_TYPE[column.type as CustomFieldTypeEnum].map(
                                (index) => (
                                  <SelectItem key={index} value={String(index)}>
                                    {OPERATOR_NAMES[Number(index) as Operator]}
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
                    disabled={fields.length <= 1}
                    onClick={() => {
                      form.unregister(`filterConditions.${index}.value`)
                      form.unregister(`filterConditions.${index}.secondaryValue`)
                      fields.length > 1 && remove(index)
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
                onClick={() => {
                  append(
                    {
                      columnName: contactFields.find((f) => f.type === CustomFieldTypeEnum.STRING)!
                        .name,
                      columnType: CustomFieldTypeEnum.STRING,
                      operator: Operator.CONTAINS,
                      value: '',
                      secondaryValue: '',
                      conditionType: ConditionType.AND,
                    },
                    { shouldFocus: false }
                  )
                }}
              >
                <PlusIcon />
                Add
              </Button>
              <p className="text-destructive text-sm">{errors.get('root')?.message}</p>
            </div>
          </div>
          <SheetFooter>
            {form.formState.isDirty && (
              <Button
                type="button"
                variant="ghost"
                disabled={!form.formState.isDirty}
                className="space-x-2"
                onClick={() => {
                  if (!form.formState.isDirty) return

                  form.reset()
                  handleSubmit({ ...form.getValues(), filterConditions: [] })
                }}
              >
                <X />
                <span>Reset filters</span>
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
            <Button type="submit">Apply {form.formState.isDirty && fields.length} filter(s)</Button>
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
          defaultValues={form.getValues()}
          isSubmitFilter={form.formState.isSubmitSuccessful}
          isValid={form.formState.isValid}
        />
      </SheetContent>
    </Sheet>
  )
}
