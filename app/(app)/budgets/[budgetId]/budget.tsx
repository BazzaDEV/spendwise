'use client'

import { cn } from '@/lib/utils'
import { CircleChevronRightIcon } from 'lucide-react'
import { TransactionsTable } from './transactions-table'
import NewTransactionForm from './new-transaction-form'
import { useQuery } from '@tanstack/react-query'
import { getBudget } from '@/api/budgets'
import { getTagsForBudget } from '@/api/tags'
import BudgetHeader from './budget-header'

export default function Budget({ id }: { id: number }) {
  const tags = useQuery({
    queryKey: ['budget-tags', id],
    queryFn: () => getTagsForBudget({ budgetId: id }),
  })

  return (
    <div className="flex flex-col gap-8">
      <BudgetHeader id={id} />
      <TransactionsTable />
      <div className=" flex flex-col gap-4 rounded-md border border-border p-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          New Transaction
        </h2>
        <NewTransactionForm
          tags={tags.data ?? []}
          defaultValues={{ budgetId: id }}
        />
      </div>
    </div>
  )
}
