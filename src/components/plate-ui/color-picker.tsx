import { useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { getMark, select, setMarks, type TEditor } from '@udecode/plate-common'
import { useEditorSelector } from '@udecode/plate-common/react'

function useCloseColoris(handler: (event: Event) => void) {
  useEffect(() => {
    document.addEventListener('close', handler, true)

    return () => {
      document.removeEventListener('close', handler, true)
    }
  }, [])
}

interface FormValues {
  color: string
}

export function ColorPicker({
  editor,
  nodeType,
  onSetOpenTooltip,
}: {
  editor: TEditor
  nodeType: string
  onSetOpenTooltip: (open: boolean | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const selectionDefined = useEditorSelector((editor) => !!editor.selection, [])
  const currentColor = useEditorSelector(
    (editor) => getMark(editor, nodeType) as string,
    [nodeType]
  )

  const form = useForm<FormValues>({
    defaultValues: {
      color: (selectionDefined && currentColor) || '',
    },
  })
  const { control } = form

  useEffect(() => {
    if (inputRef.current && colorPickerRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect()
      colorPickerRef.current.style.top = `${inputRect.top}px`
      colorPickerRef.current.style.left = `${inputRect.right + 10}px`
    }
  }, [])

  const updateColor = useCallback(
    (value: string) => {
      if (editor.selection) {
        select(editor, editor.selection)
        setMarks(editor, { [nodeType]: value })
      }
    },
    [editor, nodeType]
  )

  useEffect(() => {
    const loadColoris = async () => {
      const { coloris, init } = await import('@melloware/coloris')

      init()
      coloris({
        parent: '#coloris-picker-container',
        el: '#coloris-picker',
        alpha: true,
        margin: 10,
        onChange: (color) => {
          form.setValue('color', color)
          handleSubmit({ color })
        },
      })
    }

    loadColoris()
  }, [])

  useCloseColoris(() => onSetOpenTooltip(undefined))

  function handleSubmit({ color }: FormValues) {
    updateColor(color)
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)}>
        <FormField
          control={control}
          name="color"
          render={({ field }) => (
            <FormItem className="size-6 space-y-0">
              <FormControl>
                <>
                  <input
                    {...field}
                    readOnly
                    ref={inputRef}
                    className="size-4 cursor-pointer border-0 p-0 focus-visible:outline-none focus-visible:ring-0"
                    id="coloris-picker"
                    onClick={() => onSetOpenTooltip(false)}
                  />
                  <div
                    ref={colorPickerRef}
                    id="coloris-picker-container"
                    className="relative"
                  ></div>
                </>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
