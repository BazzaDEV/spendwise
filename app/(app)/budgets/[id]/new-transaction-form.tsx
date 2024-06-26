'use client'

import { NewTransactionSchema, newTransactionSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { CalendarIcon, Trash } from 'lucide-react'
import { createTransaction } from '@/api/transactions'
import { MultiSelect } from '@/components/ui/multi-select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetQueries, tagQueries, transactionQueries } from '@/lib/queries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { create } from 'domain'

interface Props {
  defaultValues?: {
    budgetId: number
  }
  closeDialog: () => void
}

export default function NewTransactionForm(props: Props) {
  const queryClient = useQueryClient()

  const [createMore, setCreateMore] = useState<boolean>(false)

  const [yourShare, setYourShare] = useState<number | string>(0)
  const [isShared, setIsShared] = useState<boolean>(false)

  const form = useForm<z.infer<typeof newTransactionSchema>>({
    resolver: zodResolver(newTransactionSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      tags: [],
      description: '',
      budgetId: props.defaultValues?.budgetId ?? 0,
      reimbursements: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'reimbursements',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries(transactionQueries.forBudget(data.budgetId))
      queryClient.invalidateQueries(tagQueries.forBudget(data.budgetId))

      toast.success('Transaction created.')

      if (!createMore) props.closeDialog()
    },
  })

  const transactionAmount = form.watch('amount')
  const reimbursements = form.watch('reimbursements')
  const budgetId = Number(form.watch('budgetId'))

  const budgetsQuery = useQuery(budgetQueries.lists())
  const budgets =
    !budgetsQuery.isError && !budgetsQuery.isPending ? budgetsQuery.data : []

  const tagsQuery = useQuery(tagQueries.forBudget(budgetId))
  const tags = !tagsQuery.isError && !tagsQuery.isPending ? tagsQuery.data : []

  function onSubmit(values: NewTransactionSchema) {
    mutate({
      ...values,
      reimbursements: isShared ? values.reimbursements : [],
    })
  }

  function splitEvenly() {
    const splitAmount = Number(transactionAmount) / (reimbursements.length + 1)

    const updatedReimbursements = reimbursements.map((r) => ({
      ...r,
      amount: splitAmount,
    }))

    setYourShare(splitAmount)
    form.setValue('reimbursements', updatedReimbursements)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="budgetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={String(field.value)}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem
                        key={budget.id}
                        value={String(budget.id)}
                      >
                        {budget.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                        disabled={isPending}
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
                    disabled={isPending}
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
                    onValueChange={(value) =>
                      field.onChange(!value ? '' : value)
                    }
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <Checkbox
            defaultChecked={false}
            checked={isShared}
            onCheckedChange={() => setIsShared(!isShared)}
            disabled={isPending}
          />
          <Label className="text-sm font-medium">
            This is a shared expense.
          </Label>
        </div>
        <div className={cn('flex flex-col gap-4', !isShared && 'hidden')}>
          <span className="text-xl font-medium tracking-tight">
            Reimbursements
          </span>
          <div className="flex flex-row justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="whitespace-nowrap">Your share:</span>{' '}
              <CurrencyInput
                value={yourShare}
                onValueChange={(value) => setYourShare(!value ? '' : value)}
                disabled={isPending}
              />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={splitEvenly}
                disabled={isPending}
              >
                Split Evenly
              </Button>
            </div>
          </div>
          {fields.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No reimbursements for this transaction.
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="flex w-full flex-row gap-2"
              >
                <FormField
                  control={form.control}
                  name={`reimbursements.${index}.payerName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payer</FormLabel>
                      <FormDescription />
                      <FormControl>
                        <Input
                          placeholder="Who?"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`reimbursements.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormDescription />
                      <FormControl>
                        <CurrencyInput
                          placeholder="How much?"
                          defaultValue={0}
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(!value ? '' : value)
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`reimbursements.${index}.note`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Note</FormLabel>
                      <FormDescription />
                      <FormControl>
                        <Input
                          placeholder="Anything to note?"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-1">
                  <Label className="text-sm">Actions</Label>
                  <FormDescription />
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ payerName: '', amount: 0, note: '' })}
            disabled={isPending}
          >
            Add Reimbursement
          </Button>
        </div>
        <div className="col-span-4 inline-flex items-center justify-between rounded-xl border border-border bg-zinc-50 p-4 shadow-sm">
          <div className="inline-flex items-center gap-2">
            <Checkbox
              defaultChecked={false}
              checked={createMore}
              onCheckedChange={() => setCreateMore(!createMore)}
              disabled={isPending}
            />
            <Label className="text-sm ">Create another transaction</Label>
          </div>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={props.closeDialog}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
