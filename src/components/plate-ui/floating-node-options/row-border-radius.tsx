import { useForm } from 'react-hook-form'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'

import { handleKeyDown, handleNumberInput } from '@/lib/utils'
import { setElements, type TEditor, type TElement } from '@udecode/plate-common'

interface FormValues {
  borderRadius: number
}

interface CustomElement extends TElement {
  type: string
  attributes?: {
    style?: React.CSSProperties
  }
}

function setElementBorderRadius(editor: TEditor, val: FormValues, element: CustomElement): void {
  if (!editor) return
  const currentStyles = element.attributes?.style || {}
  const currentProps = element.nodeProps || {}

  setElements(
    editor,
    {
      nodeProps: {
        ...currentProps,
        ...val,
      },
      attributes: {
        style: {
          ...currentStyles,
          borderRadius: val.borderRadius + 'px',
        },
      },
    },
    {
      match: (n) => n.id === element.id && n.type === element.type,
    }
  )
}

export function RowBorderRadius({ editor, element }: { editor: TEditor; element: TElement }) {
  const elProps = (element.nodeProps || {}) as FormValues
  const form = useForm<FormValues>({
    defaultValues: {
      borderRadius: elProps.borderRadius || 0,
    },
  })
  const { handleSubmit, control } = form

  function doSubmit(values: FormValues) {
    setElementBorderRadius(editor, values, element)
  }

  return (
    <Form {...form}>
      <form onChange={handleSubmit(doSubmit)}>
        <FormField
          control={control}
          name="borderRadius"
          rules={{
            max: 20,
            min: 0,
          }}
          render={({ field }) => (
            <FormItem className="relative flex cursor-pointer space-x-1 space-y-0 rounded-md border border-white">
              <FormControl>
                <>
                  <div className="size-4 overflow-hidden transition-all duration-300 ease-in-out">
                    <div
                      style={{
                        borderTopLeftRadius: `${field.value}px`,
                      }}
                      className="size-5 border border-muted-foreground transition-colors"
                    ></div>
                  </div>
                  <input
                    {...field}
                    className="h-4 w-6 self-center rounded-none border-0 bg-background p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                    onChange={(e) =>
                      field.onChange(parseInt(handleNumberInput(e.target.value, { max: 20 })))
                    }
                    onKeyDown={handleKeyDown}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="\d*"
                  />
                </>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
