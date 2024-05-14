'use client'

import { getBudgets } from '@/api/budgets'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EditTransactionSchema, editTransactionSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Trash } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { MultiSelect } from '@/components/ui/multi-select'
import { getTags, getTagsForBudget } from '@/api/tags'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

interface EditTransactionFormProps {
  data: EditTransactionSchema
}

export default function EditTransactionForm({
  data,
}: EditTransactionFormProps) {
  const actualAmount =
    Number(data.amount) -
    data.reimbursements.reduce((prev, curr) => prev + curr.amount, 0)

  const [yourShare, setYourShare] = useState<number | string>(actualAmount)
  const [isShared, setIsShared] = useState<boolean>(
    data.reimbursements.length > 0 || false,
  )

  const budgets = useQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgets(),
  })

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  })

  const tags =
    (!tagsQuery.isError && !tagsQuery.isPending && tagsQuery.data) || []

  const form = useForm<EditTransactionSchema>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      amount: data.amount,
      date: data.date,
      tags: data.tags,
      description: data.description,
      budgetId: data.budgetId,
      reimbursements: data.reimbursements,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'reimbursements',
  })

  const transactionAmount = form.watch('amount')
  const reimbursements = form.watch('reimbursements')

  function splitEvenly() {
    const splitAmount = Number(transactionAmount) / (reimbursements.length + 1)

    const updatedReimbursements = reimbursements.map((r) => ({
      ...r,
      amount: splitAmount,
    }))

    setYourShare(splitAmount)
    form.setValue('reimbursements', updatedReimbursements)
  }

  async function onSubmit(values: EditTransactionSchema) {
    console.log(JSON.stringify(values, null, '\t'))
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!budgets.isPending &&
                      !budgets.isError &&
                      budgets.data.map((budget) => (
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
                    onValueChange={(value) =>
                      field.onChange(!value ? '' : value)
                    }
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
              />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={splitEvenly}
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
          >
            Add Reimbursement
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="submit">Save changes</Button>
          <Button
            type="button"
            variant="secondary"
            asChild
          >
            <Link href={`/budgets/${data.budgetId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}
