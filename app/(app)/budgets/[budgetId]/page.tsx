export const dynamic = 'force-dynamic'

import { Header, HeaderSkeleton } from './header'
import { Suspense } from 'react'
import { Transactions, TransactionsSkeleton } from './transactions'

interface PageProps {
  params: {
    budgetId: number | string
  }
}

export default async function Page({ params }: PageProps) {
  const budgetId = Number(params.budgetId)

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header id={budgetId} />
      </Suspense>
      <Suspense fallback={<TransactionsSkeleton />}>
        <Transactions budgetId={budgetId} />
      </Suspense>
    </div>
  )
}
