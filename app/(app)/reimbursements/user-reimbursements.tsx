'use client'

import {
  getOwedReimbursements,
  settleReimbursementsById,
} from '@/api/reimbursements'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency2 } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { format } from 'date-fns'
import { CalendarIcon, MessageSquareTextIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

type ElementType<T> = T extends (infer U)[] ? U : never

type PropertyType<T, K extends keyof T> = T[K]

type AllUserReimbursementsAPIResponse = Awaited<
  ReturnType<typeof getOwedReimbursements>
>

type UserReimbursementsArray = PropertyType<
  AllUserReimbursementsAPIResponse,
  'data'
>
type UserReimbursements = ElementType<UserReimbursementsArray>

export default function UserReimbursements(props: {
  person: UserReimbursements
}) {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const person = props.person

  const { mutate, isPending } = useMutation({
    mutationFn: settleReimbursementsById,
    onSuccess: (data) => {
      toast.success(`Reimbursements with ${person.name} have been settled.`)
      setOpen(false)
    },
    onError: (data) => {
      toast.error(`Couldn't settle reimbursements with ${person.name}.`)
      setOpen(false)
    },
  })

  function handleSelect(id: string) {
    setSelectedIds((prev) => [...prev, id])
  }

  function handleUnselect(id: string) {
    setSelectedIds((prev) => prev.filter((p) => p !== id))
  }

  function handleSettle() {
    if (selectedIds.length > 0) {
      mutate(selectedIds)
    } else {
      mutate(person.reimbursements.map(({ id }) => id))
    }
  }

  console.log(selectedIds)

  const recent = person.reimbursements.slice(0, 4)
  const hasMore = person.reimbursements.length > 4
  const moreCount = hasMore ? person.reimbursements.length - 4 : 0

  let amount = formatCurrency2(person.amount)
  let dollars = amount.split('.', 2)[0]
  let cents = amount.split('.', 2)[1]

  return (
    <Sheet
      key={person.name}
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Card
          key={person.name}
          className="transition-all ease-in-out hover:cursor-pointer hover:border-muted-foreground hover:shadow-md"
        >
          <CardHeader>
            <CardTitle className="flex justify-between gap-4">
              <span>{person.name.split(' ')[0]}</span>
              <span className="font-mono tracking-tighter">
                {dollars}
                <span className="text-zinc-400">.{cents}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {recent.map(({ transaction: t }) => (
              <p
                key={t.id}
                className="overflow-y-hidden overflow-ellipsis whitespace-nowrap"
              >
                {t.description}
              </p>
            ))}
            {hasMore && (
              <p className="mt-1 text-primary">
                ...and {moreCount} other{' '}
                {moreCount > 1 ? 'transactions' : 'transaction'}
              </p>
            )}
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="flex max-w-screen-lg flex-col gap-7">
        <SheetHeader>
          <SheetTitle>{person.name}</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-semibold">Reimbursements</span>
          <div className="flex gap-1.5 text-xl">
            <span className="font-mono tracking-tighter">
              {dollars}
              <span className="text-zinc-400">.{cents}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {person.reimbursements.map((r) => (
            <div
              className="flex w-full flex-row gap-4 rounded-md p-2 text-sm transition hover:bg-zinc-100"
              key={r.id}
            >
              <div>
                <Checkbox
                  className="translate-y-[1px]"
                  onCheckedChange={(checked) =>
                    checked ? handleSelect(r.id) : handleUnselect(r.id)
                  }
                />
              </div>
              <div className="flex w-[100px] gap-1.5">
                <CalendarIcon className="size-4" />{' '}
                {format(r.transaction.date, 'MMM do')}
              </div>
              <span className="flex w-[300px] flex-col gap-2">
                <span className="overflow-y-hidden text-ellipsis whitespace-nowrap">
                  {r.transaction.description}
                </span>
                {r.note && (
                  <div className="flex flex-row items-start gap-2 text-orange-500">
                    <MessageSquareTextIcon className="size-4 w-4" />
                    <span className="w-full overflow-y-auto leading-none">
                      {r.note}
                    </span>
                  </div>
                )}
              </span>
              <span className="flex-1 text-right font-mono">
                {formatCurrency2(Number(r.amount))}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleSettle}
          >
            Settle{' '}
            {selectedIds.length > 0
              ? `Selected (${selectedIds.length})`
              : 'All'}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Go Back
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
