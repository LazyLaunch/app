import { useForm } from 'react-hook-form'
import type { FieldError, ControllerRenderProps } from 'react-hook-form'
import { ResponseStatus, CSRF_TOKEN } from '@/types'
import type { FormAction } from '@/types'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Button } from '@/components/ui/button'

enum FieldTypeEnum {
  Text = 'text',
  Select = 'select',
}
type FieldType = `${FieldTypeEnum}`

type CustomFieldError = Omit<FieldError, 'type'> & {
  type?: string
}

interface Field extends ControllerRenderProps {
  type?: string
}

interface BadgeProps {
  text: string
  type: string
}

interface SelectItem {
  val: string
  text: string
  badges?: BadgeProps[]
}

interface SelectFieldProps {
  selectPlaceholder?: string
  field: Field
  label: string
  selectItems?: SelectItem[]
  errors?: Record<string, CustomFieldError>
}

interface TextFieldProps {
  field: Field
  label: string
  inputType?: string
  errors?: Record<string, CustomFieldError>
}

interface Props {
  inputName: string
  inputVal: string | null | undefined
  csrfToken: string
  btnName?: string
  title: string
  label: string
  className?: string
  inputType?: string
  footerTitle: string
  fieldType?: FieldType
  selectItems?: SelectItem[]
  apiUrl: string
  method: FormAction
  successMsg: string
  errorMsg: string
}

function FormErrorMessage({ children }: any) {
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
          {selectItems.map(({ val, text, badges = [] }, index) => (
            <SelectItem key={val + index} value={val}>
              {text}
              {badges.map((badge, index) => (
                <Badge className="ml-2" key={badge.text + index}>
                  {badge.text}
                </Badge>
              ))}
            </SelectItem>
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
  apiUrl,
  method,
  successMsg,
  errorMsg,
}: Props) {
  const form = useForm({
    defaultValues: {
      [inputName]: inputVal,
    },
  })
  const errors: Record<string, CustomFieldError> = form.formState.errors as Record<
    string,
    CustomFieldError
  >

  async function onSubmit(values: object) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }
    const response = await fetch(apiUrl as string, {
      method,
      body: formData,
    })
    const data = await response.json()
    if (data.status === ResponseStatus.Success) {
      return toast.info('Account Settings', { duration: 5000, description: successMsg })
    }

    toast.error('Account Settings', { duration: 5000, description: errorMsg })
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
        <Card>
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name={inputName}
              rules={{
                required: 'Name cant be empty',
              }}
              render={({ field }) => {
                if (FieldTypeEnum.Select === fieldType)
                  return selectField({ field, label, selectItems, errors })

                return textField({ field, label, inputType, errors })
              }}
            />
          </CardContent>
          <CardFooter className="justify-between border-t bg-muted py-3">
            <FormDescription dangerouslySetInnerHTML={{ __html: footerTitle }} />
            <Button type="submit" size="sm">
              {btnName}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
