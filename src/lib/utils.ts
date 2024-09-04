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
