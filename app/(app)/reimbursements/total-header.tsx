'use client'

import { reimbursementQueries } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'

export default function TotalHeader() {
  const { data } = useSuspenseQuery(reimbursementQueries.owed())

  let totalDollars = data.total.formatted.split('.', 2)[0]
  let totalCents = data.total.formatted.split('.', 2)[1]

  return (
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
  )
}
