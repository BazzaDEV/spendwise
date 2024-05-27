import { getOwedReimbursements } from '@/api/reimbursements'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency2 } from '@/lib/utils'
import { HandCoinsIcon } from 'lucide-react'
import { Metadata } from 'next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import UserReimbursements from './user-reimbursements'

export const metadata: Metadata = {
  title: 'Reimbursements | Spendwise',
}

export const dynamic = 'force-dynamic'

export default async function Page() {
  const owed = await getOwedReimbursements()
  let total = owed.reduce((prev, curr) => prev + curr.amount, 0)
  let totalFormatted = formatCurrency2(total)

  let totalDollars = totalFormatted.split('.', 2)[0]
  let totalCents = totalFormatted.split('.', 2)[1]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tighter">
        <HandCoinsIcon className="size-12 text-zinc-300" />
        <span>Reimbursements</span>
      </h1>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex gap-5 text-5xl">
          <span className="tracking-tighter text-zinc-300">
            You should be reimbursed
          </span>
          <span className="font-mono font-black tracking-tight text-blue-500">
            {totalDollars}
            <span className="text-blue-200">.{totalCents}</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {owed.map((person) => (
          <UserReimbursements
            key={person.name}
            person={person}
          />
        ))}
      </div>
    </div>
  )
}
