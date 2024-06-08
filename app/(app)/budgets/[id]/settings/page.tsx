import { budgetQueries, getQueryClient } from '@/lib/queries'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Suspense } from 'react'
import BudgetSettings from './budget-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  const queryClient = getQueryClient()

  const budgetId = Number(params.id)

  queryClient.prefetchQuery(budgetQueries.detail(budgetId))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tighter">Settings</h1>
          <Separator />
        </div>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <BudgetSettings />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
