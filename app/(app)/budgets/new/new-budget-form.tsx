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
import { createBudget } from '@/api/budgets'
import { redirect } from 'next/navigation'

export default function NewBudgetForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof newBudgetSchema>>({
    resolver: zodResolver(newBudgetSchema),
    defaultValues: {
      name: '',
      monthlyLimit: 500,
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof newBudgetSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    const newBudget = await createBudget(values)

    console.log('New budget:', newBudget)
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
        <FormField
          control={form.control}
          name="monthlyLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Limit</FormLabel>
              <FormControl>
                <Input
                  placeholder="500.00"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                What is the maximum amount that you should be spending for this
                budget?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
