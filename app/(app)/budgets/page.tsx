import { Suspense } from 'react'
import { Budgets, BudgetsSkeleton } from './_components/budgets'
import Header from './_components/header'

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <Header />
      <Suspense fallback={<BudgetsSkeleton />}>
        <Budgets />
      </Suspense>
    </div>
  )
}
