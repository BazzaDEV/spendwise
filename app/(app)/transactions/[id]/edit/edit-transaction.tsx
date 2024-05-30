'use client'

import { getTransaction } from '@/api/transactions'
import EditTransactionForm from './edit-transaction-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { transactionQueries } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface EditTransactionProps {
  id: string
}

export default function EditTransaction({ id }: EditTransactionProps) {
  const { data } = useSuspenseQuery(transactionQueries.detail(id))

  // @ts-ignore
  return <EditTransactionForm data={data} />
}

export function EditTransactionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        {[0, 0, 0, 0, 0].map((_, index) => (
          <div
            key={index}
            className="space-y-2"
          >
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="flex w-full">
        <Button
          className="w-full"
          disabled
        >
          Save changes
        </Button>
        <Button
          disabled
          className="w-full"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
