import { WalletCardsIcon } from 'lucide-react'
import NewBudgetDialog from '../new-budget-dialog'

export default function Header() {
  return (
    <div className="flex w-full justify-between">
      <h1 className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tighter">
        <WalletCardsIcon className="size-12 text-zinc-300" />
        <span>My Budgets</span>
      </h1>
      <NewBudgetDialog />
    </div>
  )
}
