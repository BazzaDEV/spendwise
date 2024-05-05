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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewBudgetForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

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
    setLoading(true)
    const budget = await createBudget(values)
    setLoading(false)

    if ('error' in budget) {
      return toast.error(`Couldn't create a new budget`, {
        description: budget.error,
      })
    }

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
        <FormField
          control={form.control}
          name="monthlyLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Limit</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
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
