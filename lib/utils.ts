import { type ClassValue, clsx } from 'clsx'
import { formatValue } from 'react-currency-input-field'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const formatCurrency0 = (value: number | undefined) =>
  formatValue({
    value: String(value),
    prefix: '$',
    decimalScale: 0,
  })

export const formatCurrency2 = (value: number | undefined) =>
  formatValue({
    value: String(value),
    prefix: '$',
    decimalScale: 2,
  })
