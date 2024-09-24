import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { setElements, type TEditor, type TElement } from '@udecode/plate-common'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

function useCloseColoris(handler: (event: Event) => void) {
  useEffect(() => {
    document.addEventListener('close', handler, true)

    return () => {
      document.removeEventListener('close', handler, true)
    }
  }, [])
}

interface CustomElement extends TElement {
  type: string
  attributes?: {
    style?: React.CSSProperties
  }
}

function toggleHighlight(
  editor: TEditor,
  backgroundColor: string | null,
  element: CustomElement
): void {
  if (!editor) return
  const currentStyles = element.attributes?.style || {}
  const currentProps = element.nodeProps || {}

  setElements(
    editor,
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
}

export function ColorInput({
  editor,
  element,
  onSetOpenTooltip,
}: {
  editor: TEditor
  element: TElement
  onSetOpenTooltip: (open: boolean | undefined) => void
}) {
  const elProps = (element.nodeProps || {}) as FormValues

  const form = useForm<FormValues>({
    defaultValues: {
      backgroundColor: (elProps.backgroundColor || '') as string,
    },
  })
  const { control } = form

  useEffect(() => {
    const loadColoris = async () => {
      const { coloris, init } = await import('@melloware/coloris')

      init()
      coloris({
        parent: '#coloris-input-container',
        el: '#coloris-input',
        alpha: true,
        rtl: true,
        margin: 10,
        onChange: (backgroundColor) => {
          form.setValue('backgroundColor', backgroundColor)
          handleSubmit({ backgroundColor })
        },
      })
    }

    loadColoris()
  }, [])

  useCloseColoris(() => onSetOpenTooltip(undefined))

  function handleSubmit({ backgroundColor }: { backgroundColor: string }) {
    const color = backgroundColor.length === 0 ? null : backgroundColor
    toggleHighlight(editor, color, element)
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="flex space-x-0.5">
        <FormField
          control={control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <>
                  <Input
                    {...field}
                    className="h-4 w-full rounded-none border-0 p-0 pl-6 text-sm focus-visible:outline-none focus-visible:ring-0"
                    id="coloris-input"
                    placeholder="Color"
                    onClick={() => onSetOpenTooltip(false)}
                  />
                  <div id="coloris-input-container" className="relative"></div>
                </>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
