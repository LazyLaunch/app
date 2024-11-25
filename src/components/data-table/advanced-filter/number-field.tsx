import { Input } from '@/components/ui/input'

import { CustomFieldTypeEnum, OperatorEnum } from '@/enums'
import { cn, handleNumberInput } from '@/lib/utils'

import type { UseFormReturn } from 'react-hook-form'

export function NumberField({
  form,
  className,
  placeholder,
  type,
  index,
}: {
  form: UseFormReturn<any>
  className?: string
  placeholder?: string
  type?: string
  index: number
}) {
  const name = `filterConditions.${index}.value`
  const watchOperator = form.watch(`filterConditions.${index}.operator`)
  const errors = form.formState.errors
  const isNumberType = type === CustomFieldTypeEnum.NUMBER
  const showInputs =
    isNumberType &&
    [
      OperatorEnum.EQUALS,
      OperatorEnum.NOT_EQUAL,
      OperatorEnum.CONTAINS,
      OperatorEnum.NOT_CONTAIN,
      OperatorEnum.GREATER_THAN,
      OperatorEnum.LESS_THAN,
    ].includes(Number(watchOperator))
  const error = (errors.filterConditions as any)?.[index]?.value

  if (showInputs)
    return (
      <Input
        {...form.register(name, { required: showInputs, valueAsNumber: showInputs })}
        onChange={(e) => {
          const value = handleNumberInput(e.target.value, { min: 0, disableMax: true })
          form.setValue(name, value)
        }}
        className={cn(className, error && 'border-destructive focus-visible:ring-destructive')}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
      />
    )

  return (
    isNumberType && (
      <div className={className}>
        <div
          aria-label="Number filter is empty"
          className="h-full w-full rounded border border-dashed"
        />
      </div>
    )
  )
}
