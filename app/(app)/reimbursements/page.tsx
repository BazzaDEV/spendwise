import { HandCoinsIcon } from 'lucide-react'
import { Metadata } from 'next'
import { getQueryClient, reimbursementQueries } from '@/lib/queries'
import TotalHeader from './total-header'
import Reimbursements, { ReimbursementsSkeleton } from './reimbursements'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

export const metadata: Metadata = {
  title: 'Reimbursements | Spendwise',
}

export const dynamic = 'force-dynamic'

export default function Page() {
  const queryClient = getQueryClient()
  queryClient.prefetchQuery(reimbursementQueries.owed())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <h1 className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tighter">
          <HandCoinsIcon className="size-12 text-zinc-300" />
          <span>Reimbursements</span>
        </h1>
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <TotalHeader />
        </Suspense>
        <Suspense fallback={<ReimbursementsSkeleton />}>
          <Reimbursements />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
