'use client'

import { reimbursementQueries } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import UserReimbursements from './user-reimbursements'
import { Skeleton } from '@/components/ui/skeleton'

export default function Reimbursements() {
  const { data } = useSuspenseQuery(reimbursementQueries.owed())

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((person) => (
        <UserReimbursements
          key={person.name}
          person={person}
        />
      ))}
    </div>
  )
}

export function ReimbursementsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[0, 0, 0].map((_, index) => (
        <Skeleton
          key={index}
          className="h-[200px]"
        />
      ))}
    </div>
  )
}
