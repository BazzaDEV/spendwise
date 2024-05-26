'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getBudgetsWithStatistics } from '@/api/budgets'
import { formatValue } from 'react-currency-input-field'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ElementType<T> = T extends (infer U)[] ? U : never

type AllBudgetStatisticsAPIResponse = Awaited<
  ReturnType<typeof getBudgetsWithStatistics>
>
type BudgetStatistics = ElementType<AllBudgetStatisticsAPIResponse>

export const BudgetsList = ({ data }: { data: BudgetStatistics[] }) => {
  if (data.length === 0) {
    return <div>{"You don't have any budgets."}</div>
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {data.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
        />
      ))}
    </div>
  )
}

const BudgetCard = ({ budget }: { budget: BudgetStatistics }) => {
  const { statistics } = budget
  const { mtdLimit, mtdGross, mtdActual, mtdProgress } = statistics!

  return (
    <Link href={`/budgets/${budget.id}`}>
      <Card className="transition-all ease-in-out hover:cursor-pointer hover:border-muted-foreground hover:shadow-md">
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
              '*:bg-gradient-to-r *:from-green-600 *:to-green-500':
                mtdProgress < 25,
              '*:bg-gradient-to-r *:from-blue-600 *:to-blue-500':
                mtdProgress >= 25 && mtdProgress < 50,
              '*:bg-gradient-to-r *:from-yellow-600 *:to-yellow-500':
                mtdProgress >= 50 && mtdProgress < 75,
              '*:bg-gradient-to-r *:from-orange-600 *:to-orange-500':
                mtdProgress >= 75 && mtdProgress < 100,
              '*:bg-gradient-to-r *:from-red-600 *:to-red-500':
                mtdProgress >= 100,
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
