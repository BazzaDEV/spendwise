import { ReceiptIcon } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transactions | Spendwise',
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-10 text-zinc-100">
        <ReceiptIcon className="size-24" />
        <h1 className="text-6xl font-bold tracking-tighter">Coming soon...</h1>
      </div>
    </div>
  )
}
