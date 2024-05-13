export const dynamic = 'force-dynamic'

import { getBudgets } from '@/api/budgets'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BudgetsList } from './budgets-list'

export default async function Page() {
  const budgets = await getBudgets()

  if ('error' in budgets) {
    return <div>{budgets.error}</div>
  }

  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-semibold tracking-tighter">Home</h1>
      <form action={handleNewBudget}>
        <Button>New Budget</Button>
      </form>
      {budgets.length > 0 ? (
        <BudgetsList budgets={budgets} />
      ) : (
        <div>No budgets.</div>
      )}
    </div>
  )
}
