import { Button } from '@/components/ui/button'
import { CirclePlusIcon, WalletCardsIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function Header() {
  async function handleNewBudget() {
    'use server'
    return redirect('/budgets/new')
  }

  return (
    <div className="flex w-full justify-between">
      <h1 className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tighter">
        <WalletCardsIcon className="size-12 text-zinc-300" />
        <span>My Budgets</span>
      </h1>
      <form action={handleNewBudget}>
        <Button>
          <CirclePlusIcon className="mr-2 size-4" /> New Budget
        </Button>
      </form>
    </div>
  )
}
