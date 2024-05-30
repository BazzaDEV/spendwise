import {
  budgetQueries,
  getQueryClient,
  transactionQueries,
} from '@/lib/queries'
import EditTransaction, { EditTransactionSkeleton } from './edit-transaction'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Suspense } from 'react'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  const queryClient = getQueryClient()

  queryClient.prefetchQuery(transactionQueries.detail(params.id))
  queryClient.prefetchQuery(budgetQueries.lists())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-semibold tracking-tighter">
            Edit Transaction
          </h1>
          <Suspense fallback={<EditTransactionSkeleton />}>
            <EditTransaction id={params.id} />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  )
}
