'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { SelectTrigger } from '@radix-ui/react-select'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Table } from '@tanstack/react-table'
import { RotateCwIcon, WalletMinimalIcon, X, XIcon } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getBudgets } from '@/api/budgets'
import { updateTransactions } from '@/api/transactions'
import { TransactionDetails } from './transactions-table'
import { toast } from 'sonner'

interface TransactionsTableFloatingBarProps {
  table: Table<TransactionDetails>
}
export function TransactionsTableFloatingBar({
  table,
}: TransactionsTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows
  const selectedIds = rows.map((row) => row.original.id)

  const budgets = useQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgets(),
    select: (data) => data.map(({ id, name }) => ({ id, name })),
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateTransactions,
    onSuccess: () => {
      toast.success('Transactions have been updated.')
    },
    onError: () => {
      toast.error("Couldn't update transactions.")
    },
  })

  return rows.length > 0 ? (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4">
      <div className="rounded-md border bg-card p-2 shadow-2xl">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-7 items-center gap-2 rounded-md border border-dashed px-2">
            <span className="whitespace-nowrap">{rows.length} selected</span>
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-fit w-full rounded-full border border-border p-0.5"
                  onClick={() => table.toggleAllRowsSelected(false)}
                >
                  <XIcon className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear selection</TooltipContent>
            </Tooltip>
          </div>
          <Separator
            orientation="vertical"
            className="h-6"
          />
          <Select
            disabled={isPending}
            onValueChange={(value) =>
              mutateAsync({
                ids: selectedIds,
                data: { budgetId: Number(value) },
              })
            }
          >
            <Tooltip delayDuration={250}>
              <SelectTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-fit w-fit border px-2"
                  >
                    {isPending ? (
                      <RotateCwIcon className="size-4 animate-spin" />
                    ) : (
                      <WalletMinimalIcon className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
              </SelectTrigger>
              <TooltipContent>Update budget</TooltipContent>
            </Tooltip>
            <SelectContent
              align="center"
              side="top"
            >
              {budgets.data?.map((budget) => (
                <SelectItem
                  key={budget.id}
                  value={String(budget.id)}
                >
                  {budget.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ) : null
}