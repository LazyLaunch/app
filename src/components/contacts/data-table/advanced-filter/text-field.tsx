import { Input } from '@/components/ui/input'

import { CustomFieldTypeEnum, OperatorEnum } from '@/enums'
import { cn } from '@/lib/utils'
import type { UseFormReturn } from 'react-hook-form'

export function TextField({
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
  const isStringType = type === CustomFieldTypeEnum.STRING
  const showInputs =
    isStringType &&
    [
      OperatorEnum.EQUALS,
      OperatorEnum.NOT_EQUAL,
      OperatorEnum.CONTAINS,
      OperatorEnum.NOT_CONTAIN,
    ].includes(Number(watchOperator))
  const error = (errors.filterConditions as any)?.[index]?.value

  if (showInputs)
    return (
      <Input
        {...form.register(name, { required: showInputs })}
        className={cn(className, error && 'border-destructive focus-visible:ring-destructive')}
        type="text"
        placeholder={placeholder}
        autoComplete="off"
      />
    )

  return (
    isStringType && (
      <div className={className}>
        <div
          aria-label="Value filter is empty"
          className="h-full w-full rounded border border-dashed"
        />
      </div>
    )
  )
}
