import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { expandHexColor } from '@/lib/expand-hex-color'
import { cn } from '@udecode/cn'
import type { TElement } from '@udecode/plate-common'
import { Plus } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { Editor, Element, setNodes } from 'slate'

interface CustomElement extends Element {
  id: string
  backgroundColor?: string | null
}

function toggleHighlight(editor: Editor, color: string | null, nodeId: string): void {
  if (!editor) return

  setNodes<CustomElement>(
    editor,
    { backgroundColor: color },
    { match: (n) => (n as CustomElement).id === nodeId }
  )
}

interface FormState {
  bgColor: string
  inputBgColor: string
}

function handleInputMask(
  event: React.ChangeEvent<HTMLInputElement>,
  form: UseFormReturn<FormState>
): void {
  let value = event.target.value

  if (value.length === 0) {
    form.setValue('inputBgColor', '')
    form.setValue('bgColor', '')
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

  if (fullColorName.length === 7) form.setValue('bgColor', fullColorName)
  form.setValue('inputBgColor', value)
}

export function ColorInput({ editor, element }: { editor: Editor; element: TElement }) {
  const form = useForm<FormState>({
    defaultValues: {
      bgColor: (element.backgroundColor || '') as string,
      inputBgColor: (element.backgroundColor || '') as string,
    },
  })
  const { control } = form

  function handleSubmit({ bgColor }: { bgColor: string }) {
    const nodeId = element.id as string
    const color = bgColor.length === 0 ? null : bgColor
    if (bgColor.length === 7 || bgColor.length === 0) {
      toggleHighlight(editor, color, nodeId)
    }
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="flex space-x-0.5">
        <FormField
          control={control}
          name="bgColor"
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-y-0 rounded-md border border-white">
              <FormControl>
                <>
                  {!field.value && (
                    <FormLabel
                      htmlFor="rowBgColor"
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
                    id="rowBgColor"
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
          name="inputBgColor"
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
