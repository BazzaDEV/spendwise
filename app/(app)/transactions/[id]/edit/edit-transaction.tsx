import { getTransaction } from '@/api/transactions'
import EditTransactionForm from './edit-transaction-form'
import { sleep } from '@/lib/utils'

interface EditTransactionProps {
  id: string
}

export default async function EditTransaction({ id }: EditTransactionProps) {
  const data = await getTransaction({ id })

  // @ts-ignore
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold tracking-tighter">
        Edit Transaction
      </h1>
      {/* @ts-ignore */}
      <EditTransactionForm data={data} />
    </div>
  )
}
