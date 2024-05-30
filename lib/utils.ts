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

// Utility type to extract the element type from an array
export type ArrayElementType<T> = T extends (infer U)[] ? U : never

// Utility type to extract the resolved type of a promise
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

// Utility type to extract the array element type from an async function's return type
export type ExtractArrayElementType<T extends (...args: any) => any> =
  ArrayElementType<Awaited<ReturnType<T>>>
