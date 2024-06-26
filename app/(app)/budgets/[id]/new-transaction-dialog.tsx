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
import { useParams } from 'next/navigation'
import { forwardRef, useState } from 'react'

export default function NewTransactionDialog() {
  const [open, setOpen] = useState<boolean>(false)

  const params = useParams<{ id: string }>()
  const budgetId = Number(params.id)

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
          defaultValues={{ budgetId }}
          closeDialog={() => setOpen(false)}
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
