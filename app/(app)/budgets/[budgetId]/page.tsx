export const dynamic = 'force-dynamic'

import { Header, HeaderSkeleton } from './header'
import { Suspense } from 'react'
import { Transactions, TransactionsSkeleton } from './transactions'
import { Metadata, ResolvingMetadata } from 'next'
import { getBudget } from '@/api/budgets'
import {
  budgetQueries,
  getQueryClient,
  tagQueries,
  transactionQueries,
} from '@/lib/queries'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

interface Props {
  params: {
    budgetId: number
  }
}

// export async function generateMetadata(
//   { params }: Props,
//   parent: ResolvingMetadata,
// ): Promise<Metadata> {
//   const id = params.budgetId
//
//   const budget = await getBudget({ id })
//
//   return {
//     title: `Budget: ${budget.name} | Spendwise`,
//   }
// }

export default function Page({ params }: Props) {
  const budgetId = Number(params.budgetId)

  const queryClient = getQueryClient()

  queryClient.prefetchQuery(budgetQueries.list(budgetId))
  queryClient.prefetchQuery(transactionQueries.forBudget(budgetId))
  queryClient.prefetchQuery(tagQueries.forBudget(budgetId))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header id={budgetId} />
        </Suspense>
        <Suspense fallback={<TransactionsSkeleton />}>
          <Transactions />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
