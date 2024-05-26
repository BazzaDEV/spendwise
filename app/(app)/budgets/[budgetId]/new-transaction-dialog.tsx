'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CirclePlusIcon } from 'lucide-react'
import NewTransactionForm from './new-transaction-form'
import { useQuery } from '@tanstack/react-query'
import { tagQueries } from '@/lib/queries'
import { useParams } from 'next/navigation'
import { forwardRef, useState } from 'react'

export default function NewTransactionDialog() {
  const [open, setOpen] = useState<boolean>(false)

  const params = useParams<{ budgetId: string }>()
  const budgetId = Number(params.budgetId)

  const tagsQuery = useQuery(tagQueries.forBudget(budgetId))

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <NewTransactionButton />
      </DialogTrigger>
      <DialogContent className="min-w-[750px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>Create a new transaction here.</DialogDescription>
        </DialogHeader>
        <NewTransactionForm
          tags={tagsQuery.data ?? []}
          defaultValues={{ budgetId }}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export const NewTransactionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button
      {...props}
      ref={ref}
    >
      <CirclePlusIcon className="mr-2 size-4" /> New Transaction
    </Button>
  ),
)

NewTransactionButton.displayName = 'NewTransactionButton'
