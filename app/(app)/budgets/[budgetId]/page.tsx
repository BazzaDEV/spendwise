export const dynamic = 'force-dynamic'

import { getBudget } from '@/api/budgets'
import { cn, sleep } from '@/lib/utils'
import { CircleChevronRight } from 'lucide-react'
import { TransactionsTable, columns } from './transactions-table'
import { getTransactionsForBudget } from '@/api/transactions'
import NewTransactionForm from './new-transaction-form'
import { getTagsForBudget } from '@/api/tags'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import BudgetHeader from './budget-header'

interface PageProps {
  params: {
    budgetId: string
  }
}

export default async function Page({ params }: PageProps) {
  const queryClient = new QueryClient()

  const budgetId = Number(params.budgetId)

  const budget = queryClient.prefetchQuery({
    queryKey: ['budgets', budgetId],
    queryFn: () => getBudget({ id: budgetId }),
  })

  const transactions = queryClient.prefetchQuery({
    queryKey: ['budget-transactions', budgetId],
    queryFn: () => getTransactionsForBudget({ budgetId }),
  })

  const tags = queryClient.prefetchQuery({
    queryKey: ['budget-tags', budgetId],
    queryFn: () => getTagsForBudget({ budgetId }),
  })

  await Promise.all([budget, transactions, tags])

  await sleep(1500)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <BudgetHeader id={budgetId} />
        <TransactionsTable />
      </div>
    </HydrationBoundary>
  )
}
