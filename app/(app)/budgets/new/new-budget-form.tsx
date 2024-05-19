'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { newBudgetSchema } from '@/lib/schemas'
import { createBudget, getTimePeriods } from '@/api/budgets'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'

export default function NewBudgetForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const timePeriods = useQuery({
    queryKey: ['time-periods'],
    queryFn: () => getTimePeriods(),
  })

  // 1. Define your form.
  const form = useForm<z.infer<typeof newBudgetSchema>>({
    resolver: zodResolver(newBudgetSchema),
    defaultValues: {
      name: '',
      budgetLimit: {
        periodId: 1,
      },
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof newBudgetSchema>) {
    setLoading(true)
    const budget = await createBudget(values)
    setLoading(false)

    if ('error' in budget) {
      return toast.error(`Couldn't create a new budget`, {
        description: budget.error,
      })
    }

    toast.success(`${budget.name} budget was created.`)

    return router.push(`/budgets/${budget.id}`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Personal"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the name for your new budget.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4">
          <span className="col-span-3 text-xl font-medium tracking-tight">
            Budget Limit
          </span>
          <FormField
            control={form.control}
            name="budgetLimit.periodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the time period for the budget limit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!timePeriods.isPending &&
                      !timePeriods.isError &&
                      timePeriods.data.map((period) => (
                        <SelectItem
                          key={period.id}
                          value={String(period.id)}
                        >
                          {period.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {/* <FormField */}
          {/*   control={form.control} */}
          {/*   name="budgetLimit.startDate" */}
          {/*   render={({ field }) => ( */}
          {/*     <FormItem className="flex flex-col"> */}
          {/*       <FormLabel>Start Date</FormLabel> */}
          {/*       <Popover> */}
          {/*         <PopoverTrigger asChild> */}
          {/*           <FormControl> */}
          {/*             <Button */}
          {/*               variant={'outline'} */}
          {/*               className={cn( */}
          {/*                 'pl-3 text-left font-normal', */}
          {/*                 !field.value && 'text-muted-foreground', */}
          {/*               )} */}
          {/*             > */}
          {/*               {field.value ? ( */}
          {/*                 format(field.value, 'MMMM yyyy') */}
          {/*               ) : ( */}
          {/*                 <span>Pick a date</span> */}
          {/*               )} */}
          {/*               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> */}
          {/*             </Button> */}
          {/*           </FormControl> */}
          {/*         </PopoverTrigger> */}
          {/*         <PopoverContent */}
          {/*           className="w-auto p-0" */}
          {/*           align="start" */}
          {/*         > */}
          {/*           <Calendar */}
          {/*             mode="single" */}
          {/*             selected={field.value} */}
          {/*             onSelect={field.onChange} */}
          {/*             disabled={(date) => */}
          {/*               date > new Date() || date < new Date('1900-01-01') */}
          {/*             } */}
          {/*             initialFocus */}
          {/*           /> */}
          {/*         </PopoverContent> */}
          {/*       </Popover> */}
          {/*       <FormDescription> */}
          {/*         The budget limit will apply starting on this date. */}
          {/*       </FormDescription> */}
          {/*       <FormMessage /> */}
          {/*     </FormItem> */}
          {/*   )} */}
          {/* /> */}
          <FormField
            control={form.control}
            name="budgetLimit.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <CurrencyInput
                    disabled={loading}
                    placeholder="$500.00"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(!value ? '' : value)
                    }
                  />
                </FormControl>
                <FormDescription>
                  What is the budget limit for this period?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
        >
          Submit
        </Button>
      </form>
    </Form>
  )
}
