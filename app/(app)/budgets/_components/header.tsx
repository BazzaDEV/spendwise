import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default function Header() {
  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }

  return (
    <div className="flex w-full justify-between">
      <h1 className="text-4xl font-semibold tracking-tighter">My Budgets</h1>
      <form action={handleNewBudget}>
        <Button>New Budget</Button>
      </form>
    </div>
  )
}
