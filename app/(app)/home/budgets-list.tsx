'use client'

import { Budget } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useQuery } from '@tanstack/react-query'
import { getBudgetDetails, getBudgets } from '@/api/budgets'
import { formatValue } from 'react-currency-input-field'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const BudgetsList = () => {
  const { data, error, status } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgets(),
  })

  if (status === 'pending') {
    return <div>Loading...</div>
  }

  if (status === 'error') {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {data.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
        />
      ))}
    </div>
  )
}

const BudgetCard = ({
  budget,
}: {
  budget: Omit<Budget, 'reserve'> & { reserve: number }
}) => {
  const { status, data, error } = useQuery({
    queryKey: ['budgets', budget.id],
    queryFn: () => getBudgetDetails(budget),
  })

  if (status === 'pending') {
    return <span>Loading...</span>
  }

  if (status === 'error') {
    return <span>Error: {error.message}</span>
  }

  const { statistics } = data
  const { mtdLimit, mtdGross, mtdActual, mtdProgress } = statistics!

  return (
    <Link href={`/budgets/${budget.id}`}>
      <Card className="max-w-[450px] transition-all duration-300 ease-in-out hover:cursor-pointer hover:border-muted-foreground hover:shadow-lg">
        <CardHeader>
          <CardTitle>{budget.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{format(mtdLimit)}</span>
            <div className="flex flex-col items-center">
              <span>
                {format(mtdActual)} / {format(mtdLimit)}
              </span>
              <span className="font-medium">{mtdProgress.toFixed(0)}%</span>
            </div>
          </div>
          <Progress
            value={mtdProgress}
            className={cn({
              '*:bg-gradient-to-r *:from-blue-600 *:to-blue-500':
                mtdProgress < 50,
              '*:bg-gradient-to-r *:from-yellow-600 *:to-yellow-500':
                mtdProgress < 75 && mtdProgress >= 50,
              '*:bg-gradient-to-r *:from-red-600 *:to-red-500':
                mtdProgress >= 75,
            })}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">
              Spent: {format2(mtdActual)}
            </span>
            <span className="text-muted-foreground">
              Remaining: {format2(mtdLimit - mtdActual)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const format = (value: number | undefined) =>
  formatValue({
    value: String(value),
    prefix: '$',
    decimalScale: 0,
  })

const format2 = (value: number | undefined) =>
  formatValue({
    value: String(value),
    prefix: '$',
    decimalScale: 2,
  })
