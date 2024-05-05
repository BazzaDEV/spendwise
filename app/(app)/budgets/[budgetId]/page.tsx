import { getBudget } from '@/api/budgets'
import { cn } from '@/lib/utils'
import { CircleChevronRight } from 'lucide-react'
import { TransactionsTable, columns } from './transactions-table'
import { getTransactionsForBudget } from '@/api/transactions'
import NewTransactionForm from './new-transaction-form'
import { getTagsForBudget } from '@/api/tags'

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

  const [transactions, tags] = await Promise.all([
    getTransactionsForBudget({ budgetId: budget.id }),
    getTagsForBudget({ budgetId: budget.id }),
  ])

  if ('error' in transactions) {
    return <div>{transactions.error}</div>
  }

  if ('error' in tags) {
    return <div>{tags.error}</div>
  }

  console.log(tags)

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
      <div className=" flex flex-col gap-4 rounded-md border border-border p-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create a new transaction
        </h2>
        <NewTransactionForm
          tags={tags}
          defaultValues={{ budgetId }}
        />
      </div>
    </div>
  )
}
