import { Suspense } from 'react'
import { Budgets, BudgetsSkeleton } from './_components/budgets'
import Header from './_components/header'
import { Metadata } from 'next'
import { budgetQueries, getQueryClient, periodQueries } from '@/lib/queries'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

export const metadata: Metadata = {
  title: 'Budgets | Spendwise',
}

export default function Page() {
  const queryClient = getQueryClient()

  queryClient.prefetchQuery(budgetQueries.statistics())
  queryClient.prefetchQuery(periodQueries.list())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <Header />
        <Suspense fallback={<BudgetsSkeleton />}>
          <Budgets />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
