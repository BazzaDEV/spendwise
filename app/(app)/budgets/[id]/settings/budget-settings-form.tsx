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
import { BudgetSettingsSchema, budgetSettingsSchema } from '@/lib/schemas'
import { BudgetDetail, updateBudget } from '@/api/budgets'
import { toast } from 'sonner'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMutation, useQuery } from '@tanstack/react-query'
import { budgetQueries, getQueryClient, periodQueries } from '@/lib/queries'
import { useRouter } from 'next/navigation'

interface Props {
  budget: BudgetDetail
}

export default function BudgetSettingsForm(props: Props) {
  const { budget } = props
  const queryClient = getQueryClient()
  const router = useRouter()

  const form = useForm<BudgetSettingsSchema>({
    resolver: zodResolver(budgetSettingsSchema),
    defaultValues: {
      id: budget.id,
      name: budget.name,
      budgetLimit: {
        id: budget.budgetLimit!.id,
        amount: budget.budgetLimit!.amount,
        timePeriodId: budget.budgetLimit!.timePeriodId,
      },
    },
  })

  const timePeriods = useQuery(periodQueries.list())

  const { mutate, isPending } = useMutation({
    mutationFn: updateBudget,
    onSuccess: (data) => {
      router.push(`/budgets/${data.id}`)
      toast.success('Updated budget settings.')

      queryClient.invalidateQueries(budgetQueries.lists())
      queryClient.invalidateQueries(budgetQueries.detail(budget.id))
      queryClient.invalidateQueries(budgetQueries.statistics())
    },
  })

  function onSubmit(values: BudgetSettingsSchema) {
    mutate(values)
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
                  disabled={isPending}
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
            name="budgetLimit.timePeriodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={String(field.value)}
                  disabled={isPending}
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
          <FormField
            control={form.control}
            name="budgetLimit.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <CurrencyInput
                    disabled={isPending}
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
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
