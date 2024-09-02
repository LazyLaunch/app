import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNestedValue<T>(obj: Record<string, any>, key: string): T {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj) as T
}
