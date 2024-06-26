'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BudgetsList } from './budgets-list'
import { useSuspenseQuery } from '@tanstack/react-query'
import { budgetQueries } from '@/lib/queries'

export function Budgets() {
  const { data, error, isFetching } = useSuspenseQuery(
    budgetQueries.statistics(),
  )

  if (error && !isFetching) {
    throw error
  }

  return <BudgetsList data={data} />
}

export function BudgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {[0, 0, 0, 0].map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-1/2 rounded-xl" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-1/3" />
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[75px]" />
              </div>
            </div>
            <Progress value={0} />
            <div className="mt-2 flex justify-between text-sm">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
