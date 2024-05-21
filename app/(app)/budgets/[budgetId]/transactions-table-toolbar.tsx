import { Table } from '@tanstack/react-table'
import { TransactionDetails } from './transactions-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CirclePlusIcon } from 'lucide-react'
import NewTransactionDialog from './new-transaction-dialog'

export default function TransactionsTableToolbar({
  table,
}: {
  table: Table<TransactionDetails>
}) {
  return (
    <div className="flex justify-between">
      <Input
        className="max-w-[300px]"
        placeholder="Filter transactions..."
        value={
          (table.getColumn('description')?.getFilterValue() as string) ?? ''
        }
        onChange={(event) =>
          table.getColumn('description')?.setFilterValue(event.target.value)
        }
      />
      <NewTransactionDialog />
    </div>
  )
}
