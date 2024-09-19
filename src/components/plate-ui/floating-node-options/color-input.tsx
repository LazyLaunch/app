import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { expandHexColor } from '@/lib/expand-hex-color'
import { cn } from '@udecode/cn'
import { setElements, type TEditor, type TElement } from '@udecode/plate-common'
import { Plus } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { Editor } from 'slate'

interface CustomElement extends TElement {
  type: string
  attributes?: {
    style?: React.CSSProperties
  }
}

function toggleHighlight(
  editor: Editor,
  backgroundColor: string | null,
  element: CustomElement
): void {
  if (!editor) return
  const currentStyles = element.attributes?.style || {}
  const currentProps = element.nodeProps || {}

  setElements(
    editor as TEditor,
    {
      nodeProps: {
        ...currentProps,
        backgroundColor,
      },
      attributes: {
        style: {
          ...currentStyles,
          backgroundColor,
        },
      },
    },
    {
      match: (n) => n.id === element.id && n.type === element.type,
    }
  )
}

interface FormValues {
  backgroundColor: string
  inputbackgroundColor: string
}

function handleInputMask(
  event: React.ChangeEvent<HTMLInputElement>,
  form: UseFormReturn<FormValues>
): void {
  let value = event.target.value

  if (value.length === 0) {
    form.setValue('inputbackgroundColor', '')
    form.setValue('backgroundColor', '')
    return
  }

  value = value.replace(/[^#a-fA-F0-9]/g, '')
  if (!value.startsWith('#')) {
    value = '#' + value
  }

  if (value.length > 7) {
    value = value.slice(0, 7)
  }
  const fullColorName = expandHexColor(value)

  if (fullColorName.length === 7) form.setValue('backgroundColor', fullColorName)
  form.setValue('inputbackgroundColor', value)
}

export function ColorInput({ editor, element }: { editor: Editor; element: TElement }) {
  const elProps = (element.nodeProps || {}) as FormValues

  const form = useForm<FormValues>({
    defaultValues: {
      backgroundColor: (elProps.backgroundColor || '') as string,
      inputbackgroundColor: (elProps.backgroundColor || '') as string,
    },
  })
  const { control } = form

  function handleSubmit({ backgroundColor }: { backgroundColor: string }) {
    const color = backgroundColor.length === 0 ? null : backgroundColor
    if (backgroundColor.length === 7 || backgroundColor.length === 0) {
      toggleHighlight(editor, color, element)
    }
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="flex space-x-0.5">
        <FormField
          control={control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-y-0 rounded-md border border-white">
              <FormControl>
                <>
                  {!field.value && (
                    <FormLabel
                      htmlFor="rowbackgroundColor"
                      className="absolute top-1 size-4 cursor-pointer"
                    >
                      <Plus className="size-4 text-muted-foreground" />
                    </FormLabel>
                  )}
                  <Input
                    {...field}
                    type="color"
                    onChange={(e) => {
                      handleInputMask(e, form)
                    }}
                    id="rowbackgroundColor"
                    className={cn(
                      '-ml-0.5 h-6 w-5 cursor-pointer self-center rounded-none border-0 p-0',
                      {
                        invisible: !field.value,
                      }
                    )}
                  />
                </>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="inputbackgroundColor"
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-y-0 rounded-md border border-white">
              <FormControl>
                <input
                  {...field}
                  onChange={(e) => handleInputMask(e, form)}
                  placeholder="Color"
                  className="h-4 w-16 self-center rounded-none border-0 bg-background p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                  autoComplete="off"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
