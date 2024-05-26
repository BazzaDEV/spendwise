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
import { forwardRef, useState } from 'react'
import NewBudgetForm from './new-budget-form'

export default function NewBudgetDialog() {
  const [open, setOpen] = useState<boolean>(false)

  const close = () => setOpen(false)

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <NewBudgetButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Budget</DialogTitle>
          <DialogDescription>Create a new budget here.</DialogDescription>
        </DialogHeader>
        <NewBudgetForm closeDialog={close} />
      </DialogContent>
    </Dialog>
  )
}

export const NewBudgetButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button
      {...props}
      ref={ref}
    >
      <CirclePlusIcon className="mr-2 size-4" /> New Budget
    </Button>
  ),
)

NewBudgetButton.displayName = 'NewBudgetBtton'
