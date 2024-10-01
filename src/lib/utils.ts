import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNestedValue<T>(obj: Record<string, any>, key: string): T {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj) as T
}

export function capitalizeFirstLetter(text: string | undefined | null): string | undefined | null {
  if (!text && (typeof text !== 'string' || text.length === 0)) {
    return text
  }
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function handleNumberInput(value: string, options?: { min?: number; max?: number }): string {
  const minNumber = options?.min ?? 0
  const maxNumber = options?.max ?? 100

  const numValue = parseInt(value, 10)

  if (isNaN(numValue)) return '0'

  if (numValue < minNumber) return String(minNumber)
  if (numValue > maxNumber) return String(maxNumber)

  return numValue.toString()
}

export function handleFloatInput(
  value: string,
  options?: {
    min?: number
    max?: number
    maxAfterDot?: number
    skipMin?: boolean
  }
): string {
  const minNumber = options?.min ?? 0
  const maxNumber = options?.max ?? 100
  const isSkipMin = options?.skipMin ?? false
  const limitAfterDot = options?.maxAfterDot ?? 2

  const [beforeDot, afterDot] = value.split('.')[0]
  if (beforeDot?.length >= maxNumber) return String(maxNumber)
  if (afterDot?.length > limitAfterDot) return parseFloat(value).toFixed(limitAfterDot)

  const floatRegex = /^(0?\.\d{0,2}|[1-9]\d*\.\d{0,2})$/
  if (floatRegex.test(value)) return value

  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '0'

  if (numValue > maxNumber) return String(maxNumber)
  if (!isSkipMin && numValue < minNumber) return String(minNumber)

  return String(numValue)
}

export function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
  ]

  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) e.preventDefault()
}
