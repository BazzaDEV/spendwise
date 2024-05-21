import { getTransactionsForBudget } from '@/api/transactions'
import { TransactionsTable } from './transactions-table'
import { Skeleton } from '@/components/ui/skeleton'
import { NewTransactionButton } from './new-transaction-dialog'

export async function Transactions({ budgetId }: { budgetId: number }) {
  const transactions = await getTransactionsForBudget({ budgetId })

  return <TransactionsTable data={transactions} />
}

export const TransactionsSkeleton = () => (
  <div className="flex flex-col gap-10">
    <div className="flex justify-between">
      <Skeleton className="h-10 w-[300px]" />
      <NewTransactionButton disabled />
    </div>
    <Skeleton className="h-[500px] w-full" />
  </div>
)
