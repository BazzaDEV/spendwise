export const dynamic = 'force-dynamic'

import { Header, HeaderSkeleton } from './header'
import { Suspense } from 'react'
import { Transactions, TransactionsSkeleton } from './transactions'
import { Metadata, ResolvingMetadata } from 'next'
import { getBudget } from '@/api/budgets'

interface Props {
  params: {
    budgetId: number
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = params.budgetId

  const budget = await getBudget({ id })

  return {
    title: `Budget: ${budget.name} | Spendwise`,
  }
}

export default async function Page({ params }: Props) {
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
