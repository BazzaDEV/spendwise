'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { budgetQueries } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'

export function Header({ id }: { id: number }) {
  const { data } = useSuspenseQuery(budgetQueries.list(id))

  return (
    <h1
      className={cn(
        'inline-flex items-center gap-2',
        'text-4xl font-semibold tracking-tighter',
      )}
    >
      {data.name}
    </h1>
  )
}

export const HeaderSkeleton = () => <Skeleton className="h-10 w-[400px]" />
