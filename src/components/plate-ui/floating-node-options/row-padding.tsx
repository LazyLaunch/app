import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Maximize } from 'lucide-react'

import { PaddingBottomSvg } from '@/components/svg/padding-bottom'
import { PaddingLeftSvg } from '@/components/svg/padding-left'
import { PaddingRightSvg } from '@/components/svg/padding-right'
import { PaddingTopSvg } from '@/components/svg/padding-top'

import { cn, handleKeyDown, handleNumberInput } from '@/lib/utils'

import { BasePaddingPlugin, setPadding } from '@/components/plate-ui/plugins/padding'

import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import type { TEditor, TElement } from '@udecode/plate-common'
import type { PlateEditor } from '@udecode/plate-common/react'
import { useState } from 'react'

interface FormValues {
  left: string
  right: string
  top: string
  bottom: string
  horizontal: string
  vertical: string
  isAllSides: boolean
}

function FormInput({
  children,
  value,
  name,
  tooltip,
  tooltipSide,
  onChange = () => {},
}: {
  children: any
  value: string
  name: string
  tooltip: string
  tooltipSide: TooltipContentProps['side']
  onChange?: (val: string) => void
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex cursor-pointer space-x-1 space-y-0 rounded-md border border-white">
            <>
              <label htmlFor={`${name}Input`} className="size-4 cursor-pointer">
                {children}
              </label>
              <input
                value={value}
                id={`${name}Input`}
                className="h-4 w-6 self-center rounded-none border-0 bg-background p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                autoComplete="off"
                onChange={(e) => {
                  const val = handleNumberInput(e.target.value)
                  onChange(val)
                }}
                onKeyDown={handleKeyDown}
                type="text"
                inputMode="numeric"
                pattern="\d*"
              />
            </>
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent sideOffset={5} side={tooltipSide}>
            {tooltip}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

export function RowPadding({ element, editor }: { editor: TEditor; element: TElement }) {
  const isAllSides = (editor as PlateEditor).getOption(BasePaddingPlugin, 'isAllSides')
  const [top, right, bottom, left] = `${element.padding || '0 0 0 0'}`.match(/\d+/g) as string[]
  const anyPadding = Boolean(left && right && top && bottom)

  const [values, setValues] = useState<FormValues>({
    left,
    right,
    top,
    bottom,
    horizontal: left === right ? left : '0',
    vertical: top === bottom ? top : '0',
    isAllSides:
      typeof isAllSides !== 'undefined' ? isAllSides : Boolean(element.padding) || anyPadding,
  })

  return (
    <form className="flex w-full justify-between space-x-5">
      <div className="flex w-full flex-col gap-3">
        {values.isAllSides && (
          <div className="flex justify-between">
            <FormInput
              tooltipSide="top"
              value={values.horizontal}
              name="horizontal"
              tooltip="Horizontal Sides"
              onChange={(horizontal) => {
                setValues((prevState) => ({
                  ...prevState,
                  left: horizontal,
                  right: horizontal,
                  horizontal,
                }))
                setPadding(editor as PlateEditor, {
                  value: `${values.top} ${horizontal} ${values.bottom} ${horizontal}`,
                })
              }}
            >
              <AlignHorizontalSpaceAround className="size-4 text-muted-foreground" />
            </FormInput>
            <FormInput
              tooltipSide="top"
              value={values.vertical}
              name="vertical"
              tooltip="Vertical Sides"
              onChange={(vertical) => {
                setValues((prevState) => ({
                  ...prevState,
                  top: vertical,
                  bottom: vertical,
                  vertical,
                }))

                setPadding(editor as PlateEditor, {
                  value: `${vertical} ${values.right} ${vertical} ${values.left}`,
                })
              }}
            >
              <AlignVerticalSpaceAround className="size-4 text-muted-foreground" />
            </FormInput>
          </div>
        )}
        {!values.isAllSides && (
          <>
            <div className="flex justify-between">
              <FormInput
                tooltipSide="top"
                value={values.left}
                name="left"
                tooltip="Left Padding"
                onChange={(left) => {
                  setValues((prevState) => ({ ...prevState, left, horizontal: '0' }))
                  setPadding(editor as PlateEditor, {
                    value: `${values.top} ${values.right} ${values.bottom} ${left}`,
                  })
                }}
              >
                <PaddingLeftSvg className="size-4 text-muted-foreground" />
              </FormInput>
              <FormInput
                tooltipSide="top"
                value={values.top}
                name="top"
                tooltip="Top Padding"
                onChange={(top) => {
                  setValues((prevState) => ({ ...prevState, top, vertical: '0' }))
                  setPadding(editor as PlateEditor, {
                    value: `${top} ${values.right} ${values.bottom} ${values.left}`,
                  })
                }}
              >
                <PaddingTopSvg className="size-4 text-muted-foreground" />
              </FormInput>
            </div>
            <div className="flex justify-between">
              <FormInput
                tooltipSide="bottom"
                value={values.right}
                name="right"
                tooltip="Right Padding"
                onChange={(right) => {
                  setValues((prevState) => ({ ...prevState, right, horizontal: '0' }))
                  setPadding(editor as PlateEditor, {
                    value: `${values.top} ${right} ${values.bottom} ${values.left}`,
                  })
                }}
              >
                <PaddingRightSvg className="size-4 text-muted-foreground" />
              </FormInput>
              <FormInput
                tooltipSide="bottom"
                value={values.bottom}
                name="bottom"
                tooltip="Bottom Padding"
                onChange={(bottom) => {
                  setValues((prevState) => ({ ...prevState, bottom, vertical: '0' }))
                  setPadding(editor as PlateEditor, {
                    value: `${values.top} ${values.right} ${bottom} ${values.left}`,
                  })
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
                setValues((prevState) => ({
                  ...prevState,
                  isAllSides: !prevState.isAllSides,
                }))
                ;(editor as PlateEditor).setOption(
                  BasePaddingPlugin,
                  'isAllSides',
                  typeof isAllSides === 'undefined' ? false : !isAllSides
                )
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
              {values.isAllSides ? 'Switch to a multiple side' : 'Switch to a single side'}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </form>
  )
}
