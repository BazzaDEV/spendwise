import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { Budgets, BudgetsSkeleton } from './_components/budgets'

export default function Page() {
  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-semibold tracking-tighter">My Budgets</h1>
        <form action={handleNewBudget}>
          <Button>New Budget</Button>
        </form>
      </div>
      <Suspense fallback={<BudgetsSkeleton />}>
        <Budgets />
      </Suspense>
    </div>
  )
}
