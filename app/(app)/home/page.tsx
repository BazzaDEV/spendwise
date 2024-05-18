export const dynamic = 'force-dynamic'

import { getBudgets, getBudgetsWithStatistics } from '@/api/budgets'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BudgetsList } from './budgets-list'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export default async function Page() {
  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['budget-statistics'],
    queryFn: () => getBudgetsWithStatistics(),
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-semibold tracking-tighter">My Budgets</h1>
        <form action={handleNewBudget}>
          <Button>New Budget</Button>
        </form>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BudgetsList />
      </HydrationBoundary>
    </div>
  )
}
