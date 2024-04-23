import { getBudgets } from '@/api/budgets'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function Page() {
  const budgets = await getBudgets()

  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }

  return (
    <div>
      <h1>Home</h1>
      <div>You do not have any budgets.</div>
      <form action={handleNewBudget}>
        <Button>New Budget</Button>
      </form>
    </div>
  )
}
