export const dynamic = 'force-dynamic'

import { getBudgets } from '@/api/budgets'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BudgetsList } from './budgets-list'

export default function Page() {
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
      <BudgetsList />
    </div>
  )
}
