export interface PaddingElement {
  left?: number
  top?: number
  right?: number
  bottom?: number
  horizontal?: number
  vertical?: number
  isToggledInputs?: boolean
}

export type PaddingPostion = 'left' | 'top' | 'right' | 'bottom'

export interface PaddingPluginOptions {
  measure?: string
  isAllSides?: boolean | undefined
}
