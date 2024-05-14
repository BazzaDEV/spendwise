'use client'

import { getTransaction } from '@/api/transactions'
import { useQuery } from '@tanstack/react-query'
import EditTransactionForm from './edit-transaction-form'

interface EditTransactionProps {
  id: string
}

export default function EditTransaction({ id }: EditTransactionProps) {
  const { status, data, error } = useQuery({
    queryKey: ['transactions', id],
    queryFn: () => getTransaction({ id }),
  })

  if (status === 'pending') {
    return <div>Loading...</div>
  } else if (status === 'error') {
    return <div>Error: {error.message}</div>
  } else {
    return (
      <div>
        {/* <pre>{JSON.stringify(data, null, '\t')}</pre> */}
        <EditTransactionForm data={data} />
      </div>
    )
  }
}
