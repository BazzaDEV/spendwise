'use client'

import { NewTransactionSchema, newTransactionSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { createTransaction } from '@/api/transactions'
import { MultiSelect } from '@/components/ui/multi-select'
import { Tag } from '@prisma/client'
import ReimbursementsList from '@/components/misc/reimbursements-list'
import { CurrencyInput } from '@/components/ui/currency-input'

interface Props {
  tags: Pick<Tag, 'id' | 'label'>[]
  defaultValues?: {
    budgetId: number
  }
}

export default function NewTransactionForm({ defaultValues, tags }: Props) {
  const form = useForm<z.infer<typeof newTransactionSchema>>({
    resolver: zodResolver(newTransactionSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      tags: [],
      description: '',
      budgetId: defaultValues?.budgetId ?? 0,
      reimbursements: [],
    },
  })

  const amount = form.watch('amount')

  async function onSubmit(values: NewTransactionSchema) {
    console.log(values)

    const newTransaction = await createTransaction(values)
    console.log('New transaction:', newTransaction)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tags}
                  value={field.value || []}
                  onChange={(selectedOptions) =>
                    field.onChange(selectedOptions)
                  }
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Coffee @ Happy Goat"
                  {...field}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onValueChange={(value) => field.onChange(!value ? '' : value)}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reimbursements"
          render={({ field }) => (
            <FormItem>
              <FormLabel></FormLabel>
              <FormControl>
                <ReimbursementsList
                  onChange={field.onChange}
                  totalAmount={amount}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="col-span-4"
        >
          Submit
        </Button>
      </form>
    </Form>
  )
}
