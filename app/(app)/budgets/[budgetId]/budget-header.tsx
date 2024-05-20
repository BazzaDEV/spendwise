'use client'

import { getBudget } from '@/api/budgets'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { CircleChevronRightIcon } from 'lucide-react'

export default function BudgetHeader({ id }: { id: number }) {
  const { data, error, isPending, isError } = useQuery({
    queryKey: ['budgets', id],
    queryFn: () => getBudget({ id }),
  })

  return (
    <h1
      className={cn(
        'inline-flex items-center gap-2',
        'text-4xl font-semibold tracking-tighter',
      )}
    >
      Budget <CircleChevronRightIcon className="size-8" /> {data?.name}
    </h1>
  )
}
