'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { budgetQueries } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { SettingsIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header({ id }: { id: number }) {
  const router = useRouter()

  const { data } = useSuspenseQuery(budgetQueries.list(id))

  return (
    <div className="flex items-center justify-between">
      <h1
        className={cn(
          'inline-flex items-center gap-2',
          'text-4xl font-semibold tracking-tighter',
        )}
      >
        {data.name}
      </h1>
      <div>
        <Button
          className="gap-1.5"
          variant="secondary"
          onClick={() => router.push(`/budgets/${id}/settings`)}
        >
          <SettingsIcon className="size-4" /> Settings
        </Button>
      </div>
    </div>
  )
}

export const HeaderSkeleton = () => <Skeleton className="h-10 w-[400px]" />
