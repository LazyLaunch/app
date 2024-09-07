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
  const numValue = parseInt(value, 10)
  const minNumber = 0
  const maxNumber = 100

  if (isNaN(numValue)) return '0'
  if (numValue < (options?.min || minNumber)) return String(options?.min || minNumber)
  if (numValue > (options?.max || maxNumber)) return String(options?.max || maxNumber)

  return numValue.toString()
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
