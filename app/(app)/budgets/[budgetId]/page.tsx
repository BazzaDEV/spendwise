import { getBudget } from '@/api/budgets'
import { cn } from '@/lib/utils'
import { CircleChevronRight } from 'lucide-react'
import { TransactionsTable, columns } from './transactions-table'
import { getTransactionsForBudget } from '@/api/transactions'
import { Button } from '@/components/ui/button'
import NewTransactionForm from './new-transaction-form'

interface PageProps {
  params: {
    budgetId: string
  }
}

export default async function Page({ params }: PageProps) {
  const budgetId = Number(params.budgetId)

  const budget = await getBudget({ id: budgetId })

  if ('error' in budget) {
    return <div>{budget.error}</div>
  }

  const transactions = await getTransactionsForBudget({ budgetId: budget.id })

  if ('error' in transactions) {
    return <div>{transactions.error}</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <h1
        className={cn(
          'inline-flex items-center gap-2',
          'text-4xl font-semibold tracking-tighter',
        )}
      >
        Budget <CircleChevronRight className="size-8" /> {budget.name}
      </h1>
      <TransactionsTable
        columns={columns}
        data={transactions}
      />
      <NewTransactionForm defaultValues={{ budgetId }} />
    </div>
  )
}
