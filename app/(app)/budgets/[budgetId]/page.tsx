export const dynamic = 'force-dynamic'

import { getBudget } from '@/api/budgets'
import { cn } from '@/lib/utils'
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
import Budget from './budget'

interface PageProps {
  params: {
    budgetId: string
  }
}

export default async function Page({ params }: PageProps) {
  const queryClient = new QueryClient()

  const budget = queryClient.prefetchQuery({
    queryKey: ['budgets', params.budgetId],
    queryFn: () => getBudget({ id: Number(params.budgetId) }),
  })

  const transactions = queryClient.prefetchQuery({
    queryKey: ['budget-transactions', params.budgetId],
    queryFn: () =>
      getTransactionsForBudget({ budgetId: Number(params.budgetId) }),
  })

  const tags = queryClient.prefetchQuery({
    queryKey: ['budget-tags', params.budgetId],
    queryFn: () => getTagsForBudget({ budgetId: Number(params.budgetId) }),
  })

  await Promise.all([budget, transactions, tags])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Budget id={Number(params.budgetId)} />
    </HydrationBoundary>
  )
}
