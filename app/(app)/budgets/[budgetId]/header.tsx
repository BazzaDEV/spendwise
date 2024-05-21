import { getBudget } from '@/api/budgets'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export async function Header({ id }: { id: number }) {
  const budget = await getBudget({ id })

  return (
    <h1
      className={cn(
        'inline-flex items-center gap-2',
        'text-4xl font-semibold tracking-tighter',
      )}
    >
      {budget.name}
    </h1>
  )
}

export const HeaderSkeleton = () => <Skeleton className="h-10 w-[400px]" />
