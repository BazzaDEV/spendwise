import * as React from 'react'

import { cn } from '@/lib/utils'
import { default as CurrencyInputPrimitive } from 'react-currency-input-field'
import { CurrencyInputProps as CurrencyInputPrimitiveProps } from 'react-currency-input-field'

export interface CurrencyInputProps extends CurrencyInputPrimitiveProps {}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <CurrencyInputPrimitive
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        prefix="$"
        decimalScale={2}
        {...props}
      />
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
