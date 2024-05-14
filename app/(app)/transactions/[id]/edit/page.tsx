import { getTransaction } from '@/api/transactions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import EditTransaction from './edit-transaction'
import { getBudgets } from '@/api/budgets'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const queryClient = new QueryClient()

  const transactions = queryClient.prefetchQuery({
    queryKey: ['transactions', params.id],
    queryFn: () => getTransaction({ id: params.id }),
  })

  const budgets = queryClient.prefetchQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgets(),
  })

  await Promise.allSettled([transactions, budgets])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditTransaction id={params.id} />
    </HydrationBoundary>
  )
}
