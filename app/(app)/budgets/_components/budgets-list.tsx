'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { deleteBudget, getBudgetsWithStatistics } from '@/api/budgets'
import Link from 'next/link'
import { cn, formatCurrency0, formatCurrency2 } from '@/lib/utils'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  budgetQueries,
  getQueryClient,
  reimbursementQueries,
  tagQueries,
  transactionQueries,
} from '@/lib/queries'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

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
  const router = useRouter()
  const queryClient = getQueryClient()

  const { statistics } = budget
  const { mtdLimit, mtdGross, mtdActual, mtdProgress } = statistics!

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteBudget(budget.id),
    onSuccess: () => {
      queryClient.invalidateQueries(budgetQueries.lists())
      queryClient.invalidateQueries(budgetQueries.list(budget.id))
      queryClient.invalidateQueries(budgetQueries.statistics())
      queryClient.invalidateQueries(transactionQueries.forBudget(budget.id))
      queryClient.invalidateQueries(tagQueries.forBudget(budget.id))
      queryClient.invalidateQueries(reimbursementQueries.owed())

      toast.success(`${budget.name} budget was deleted.`)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Link href={`/budgets/${budget.id}`}>
      <Card className="transition-all ease-in-out hover:cursor-pointer hover:border-muted-foreground hover:shadow-md">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>{budget.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <EllipsisVerticalIcon className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/budgets/${budget.id}/settings`)
                  }}
                  className="inline-flex w-full items-center gap-1.5"
                >
                  <SettingsIcon className="size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    mutate()
                  }}
                  className="inline-flex w-full items-center gap-1.5"
                >
                  <TrashIcon className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{formatCurrency0(mtdLimit)}</span>
            <div className="flex flex-col items-center">
              <span>
                {formatCurrency0(mtdActual)} / {formatCurrency0(mtdLimit)}
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
              Spent: {formatCurrency2(mtdActual)}
            </span>
            <span className="text-muted-foreground">
              Remaining: {formatCurrency2(mtdLimit - mtdActual)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
