import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Maximize } from 'lucide-react'
import { useForm, type Control } from 'react-hook-form'

import { PaddingBottomSvg } from '@/components/svg/padding-bottom'
import { PaddingLeftSvg } from '@/components/svg/padding-left'
import { PaddingRightSvg } from '@/components/svg/padding-right'
import { PaddingTopSvg } from '@/components/svg/padding-top'

import { cn, handleKeyDown, handleNumberInput } from '@/lib/utils'

import { buttonVariants } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import { setElements, type TEditor, type TElement } from '@udecode/plate-common'
import { type Editor } from 'slate'

interface FormValues {
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
  paddingHorizontal: number
  paddingVertical: number
  isToggledInputs: boolean
}

function convertValuesToInt(obj: FormValues): Record<string, number> {
  const result: Record<string, number> = {}
  const { isToggledInputs, ...rest } = obj

  for (const [key, value] of Object.entries(rest)) {
    result[key] = parseInt(value.toString(), 10)
  }

  return result
}

interface CustomElement extends TElement {
  type: string
  attributes?: {
    style?: React.CSSProperties
  }
}

function setElementPadding(editor: Editor, val: FormValues, element: CustomElement): void {
  if (!editor) return
  const currentStyles = element.attributes?.style || {}
  const currentProps = element.nodeProps || {}

  setElements(
    editor as TEditor,
    {
      nodeProps: {
        ...currentProps,
        ...val,
      },
      attributes: {
        style: {
          ...currentStyles,
          paddingLeft: val.paddingLeft + 'px',
          paddingRight: val.paddingRight + 'px',
          paddingTop: val.paddingTop + 'px',
          paddingBottom: val.paddingBottom + 'px',
        },
      },
    },
    {
      match: (n) => n.id === element.id && n.type === element.type,
    }
  )
}

function FormInput({
  children,
  control,
  name,
  tooltip,
  tooltipSide,
  onChange = () => {},
}: {
  children: any
  control: Control<FormValues, any>
  name: string
  tooltip: string
  tooltipSide: TooltipContentProps['side']
  onChange?: (val: string) => void
}) {
  return (
    <FormField
      control={control}
      name={name as keyof FormValues}
      rules={{
        max: 100,
        min: 0,
      }}
      render={({ field }) => (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <FormItem className="relative flex cursor-pointer space-x-1 space-y-0 rounded-md border border-white">
                <FormControl>
                  <>
                    <FormLabel htmlFor={`${field.name}Input`} className="size-4 cursor-pointer">
                      {children}
                    </FormLabel>
                    <input
                      {...field}
                      value={`${field.value}`}
                      id={`${field.name}Input`}
                      className="h-4 w-6 self-center rounded-none border-0 bg-background p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                      autoComplete="off"
                      onChange={(e) => {
                        const val = handleNumberInput(e.target.value)
                        field.onChange(val)
                        onChange(val)
                      }}
                      onKeyDown={handleKeyDown}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </>
                </FormControl>
              </FormItem>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent sideOffset={5} side={tooltipSide}>
                {tooltip}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    />
  )
}

export function RowPadding({ element, editor }: { editor: Editor; element: TElement }) {
  const elProps = (element.nodeProps || {}) as FormValues

  const form = useForm<FormValues>({
    defaultValues: {
      paddingLeft: elProps.paddingLeft || 0,
      paddingRight: elProps.paddingRight || 0,
      paddingTop: elProps.paddingTop || 0,
      paddingBottom: elProps.paddingBottom || 0,
      paddingHorizontal: elProps.paddingHorizontal || 0,
      paddingVertical: elProps.paddingVertical || 0,
      isToggledInputs: elProps.isToggledInputs || false,
    },
  })
  const { control, handleSubmit, watch } = form

  function doSubmit(values: FormValues) {
    const convertedValues = convertValuesToInt(values)
    setElementPadding(editor, { ...values, ...convertedValues }, element)
  }

  return (
    <Form {...form}>
      <form className="flex w-full justify-between space-x-5" onChange={handleSubmit(doSubmit)}>
        <div className="flex w-full flex-col gap-3">
          {!watch('isToggledInputs') && (
            <div className="flex justify-between">
              <FormInput
                tooltipSide="top"
                control={control}
                name="paddingHorizontal"
                tooltip="Horizontal padding"
                onChange={(val) => {
                  form.setValue('paddingHorizontal', parseInt(val))
                  form.setValue('paddingLeft', parseInt(val))
                  form.setValue('paddingRight', parseInt(val))
                }}
              >
                <AlignHorizontalSpaceAround className="size-4 text-muted-foreground" />
              </FormInput>
              <FormInput
                tooltipSide="top"
                control={control}
                name="paddingVertical"
                tooltip="Vertical padding"
                onChange={(val) => {
                  form.setValue('paddingVertical', parseInt(val))
                  form.setValue('paddingTop', parseInt(val))
                  form.setValue('paddingBottom', parseInt(val))
                }}
              >
                <AlignVerticalSpaceAround className="size-4 text-muted-foreground" />
              </FormInput>
            </div>
          )}
          {watch('isToggledInputs') && (
            <>
              <div className="flex justify-between">
                <FormInput
                  tooltipSide="top"
                  control={control}
                  name="paddingLeft"
                  tooltip="Left Padding"
                  onChange={() => {
                    form.setValue('paddingHorizontal', 0)
                  }}
                >
                  <PaddingLeftSvg className="size-4 text-muted-foreground" />
                </FormInput>
                <FormInput
                  tooltipSide="top"
                  control={control}
                  name="paddingTop"
                  tooltip="Top Padding"
                  onChange={() => {
                    form.setValue('paddingVertical', 0)
                  }}
                >
                  <PaddingTopSvg className="size-4 text-muted-foreground" />
                </FormInput>
              </div>
              <div className="flex justify-between">
                <FormInput
                  tooltipSide="bottom"
                  control={control}
                  name="paddingRight"
                  tooltip="Right Padding"
                  onChange={() => {
                    form.setValue('paddingHorizontal', 0)
                  }}
                >
                  <PaddingRightSvg className="size-4 text-muted-foreground" />
                </FormInput>
                <FormInput
                  tooltipSide="bottom"
                  control={control}
                  name="paddingBottom"
                  tooltip="Bottom Padding"
                  onChange={() => {
                    form.setValue('paddingVertical', 0)
                  }}
                >
                  <PaddingBottomSvg className="size-4 text-muted-foreground" />
                </FormInput>
              </div>
            </>
          )}
        </div>

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                onClick={() => {
                  form.setValue('isToggledInputs', !watch('isToggledInputs'))
                  doSubmit(form.getValues())
                }}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'iconXs' }),
                  '-mt-0.5 cursor-pointer px-1'
                )}
              >
                <Maximize className="size-4 text-muted-foreground" />
              </a>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent sideOffset={5} side="top">
                {watch('isToggledInputs') ? 'Switch to a multiple side' : 'Switch to a single side'}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </form>
    </Form>
  )
}
