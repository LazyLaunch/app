import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getBlockAbove, type SlateEditor, type TEditor, type TElement } from '@udecode/plate-common'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { setBlockBackgroundColor } from '@udecode/plate-font'

function useCloseColoris(handler: (event: Event) => void) {
  useEffect(() => {
    document.addEventListener('close', handler, true)

    return () => {
      document.removeEventListener('close', handler, true)
    }
  }, [])
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
  const form = useForm<FormValues>({
    defaultValues: {
      backgroundColor: (element.backgroundColor || '') as string,
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
    if (!editor) return
    const color = backgroundColor.length === 0 ? '' : backgroundColor
    const block = getBlockAbove(editor)
    if (block) setBlockBackgroundColor(editor as SlateEditor, block, color)
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
