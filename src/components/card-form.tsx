import { actions, isInputError } from 'astro:actions'
import * as React from 'react'

import { cn, getNestedValue } from '@/lib/utils'
import { CSRF_TOKEN, TOAST_SUCCESS_TIME } from '@/types'
import { Loader2 } from 'lucide-react'
import type {
  ControllerRenderProps,
  FieldError,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  SelectItem as LocalSelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { navigate } from 'astro:transitions/client'

type ActionFunction = (formData: FormData) => Promise<{ error: string | null }>

enum FieldTypeEnum {
  Text = 'text',
  Select = 'select',
  BtnDanger = 'btnDanger',
}
type FieldType = `${FieldTypeEnum}`

export interface FormValues {
  [key: string]: string | number | undefined
}

export type CustomFieldError = Omit<FieldError, 'type'> & {
  type?: string
}

interface Field extends ControllerRenderProps {
  type?: string
}

interface BadgeProps {
  text: string
  type: string
}

export interface SelectItem {
  val: string
  text: string
  disabled: boolean
  badges?: BadgeProps[]
}

interface SelectFieldProps {
  selectPlaceholder?: string
  field: Field
  label: string
  selectItems?: SelectItem[]
  errors?: Record<string, CustomFieldError>
}

interface BtnDangerProps extends TextFieldProps {}

interface TextFieldProps {
  field: Field
  label: string
  inputType?: string
  errors?: Record<string, CustomFieldError>
}

interface Props {
  inputName: string
  inputVal: string | number | undefined
  csrfToken: string
  btnName?: string
  title: string
  label: string
  className?: string
  inputType?: string
  footerTitle?: string
  fieldType?: FieldType
  selectItems?: SelectItem[]
  successMsg: string
  validationRules?: RegisterOptions
  handleCallback?: (values: FormValues) => void
  skipDirty?: boolean
  actionsPath: string
  handleUrlRedirect?: string
  queryParams?: Record<string, string>
}

export function FormErrorMessage({ children }: any) {
  if (!children) return

  return <p className="text-sm font-normal text-destructive">{children}</p>
}

function selectField({
  selectPlaceholder = 'Select...',
  field,
  label,
  selectItems = [],
  errors = {},
}: SelectFieldProps) {
  return (
    <FormItem className="space-y-3">
      <FormLabel className="font-normal">{label}</FormLabel>
      <Select name={field.name} onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {selectItems.map(({ val, text, disabled, badges = [] }, index) => (
            <LocalSelectItem
              disabled={disabled}
              key={val + index}
              value={val}
              className={cn(disabled && 'disabled')}
            >
              {text}
              {badges.map((badge, index) => (
                <Badge className="ml-2" key={badge.text + index}>
                  {badge.text}
                </Badge>
              ))}
            </LocalSelectItem>
          ))}
        </SelectContent>
        <FormErrorMessage>{errors?.[field.name]?.message}</FormErrorMessage>
      </Select>
    </FormItem>
  )
}

function textField({ field, label, inputType, errors = {} }: TextFieldProps) {
  return (
    <FormItem className="space-y-3">
      <FormLabel className="font-normal">{label}</FormLabel>
      <FormControl>
        <Input {...field} type={inputType} />
      </FormControl>
      <FormErrorMessage>{errors?.[field.name]?.message}</FormErrorMessage>
    </FormItem>
  )
}

function btnDanger({ field, label, inputType, errors = {} }: BtnDangerProps) {
  return (
    <FormItem className="space-y-3">
      <FormLabel className="font-normal">{label}</FormLabel>
      <FormControl>
        <Input {...field} type={inputType} hidden />
      </FormControl>
      <FormErrorMessage>{errors?.[field.name]?.message}</FormErrorMessage>
    </FormItem>
  )
}

function renderQueryParams(queryParams: Record<string, string>, form: UseFormReturn) {
  const keys = Object.keys(queryParams)
  return keys.map((key, index) => {
    return (
      <input
        {...form.register(key, { required: true })}
        key={`${key}-${index}`}
        type="hidden"
        name={key}
        value={queryParams[key]}
      />
    )
  })
}

export function CardForm({
  inputName,
  inputVal,
  csrfToken,
  btnName = 'Save',
  title,
  label,
  footerTitle,
  className,
  inputType,
  fieldType = FieldTypeEnum.Text,
  selectItems = [],
  successMsg,
  validationRules = {},
  handleCallback,
  skipDirty = false,
  actionsPath,
  handleUrlRedirect,
  queryParams = {},
}: Props) {
  const [isLoading, setLoading] = React.useState(false)
  const form = useForm<FormValues>({
    defaultValues: {
      ...queryParams,
      csrfToken: csrfToken,
      [inputName]: inputVal,
    },
  })
  const errors: Record<string, CustomFieldError> = form.formState.errors as Record<
    string,
    CustomFieldError
  >
  const isDirty: boolean = skipDirty || form.formState.isDirty

  async function onSubmit(values: FormValues) {
    if (!isDirty) return
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value?.toString() || '')
    }
    const getActions = getNestedValue<ActionFunction>(actions, actionsPath)
    const { error } = await getActions(formData)

    setLoading(false)
    if (isInputError(error)) {
      const { fields } = error

      for (const key of Object.keys(fields)) {
        const message = fields[key as keyof typeof fields]?.[0]
        form.setError(key, { message })
      }
      return
    }

    form.reset(values)
    handleCallback?.(values)
    toast.info(title, { duration: TOAST_SUCCESS_TIME, description: successMsg })
    if (handleUrlRedirect) navigate(handleUrlRedirect)
  }

  return (
    <Form {...form}>
      <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={csrfToken}
        />
        {renderQueryParams(queryParams, form)}
        <Card
          className={cn('overflow-hidden', {
            'border-rose-100': FieldTypeEnum.BtnDanger === fieldType,
          })}
        >
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name={inputName}
              rules={validationRules}
              render={({ field }) => {
                if (FieldTypeEnum.Select === fieldType)
                  return selectField({ field, label, selectItems, errors })

                if (FieldTypeEnum.BtnDanger === fieldType)
                  return btnDanger({ field, label, errors, inputType })

                return textField({ field, label, inputType, errors })
              }}
            />
          </CardContent>
          <CardFooter
            className={cn('justify-between border-t bg-muted py-3', {
              'bg-rose-100': FieldTypeEnum.BtnDanger === fieldType,
              'flex-row-reverse': !footerTitle,
            })}
          >
            {footerTitle && <FormDescription dangerouslySetInnerHTML={{ __html: footerTitle }} />}
            <Button
              disabled={isLoading || !isDirty}
              type="submit"
              size="sm"
              variant={FieldTypeEnum.BtnDanger === fieldType ? 'destructive' : 'default'}
            >
              {isLoading && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              )}
              {!isLoading && btnName}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
