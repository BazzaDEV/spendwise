import { getTransaction } from '@/api/transactions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import EditTransaction from './edit-transaction'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['transactions', params.id],
    queryFn: () => getTransaction({ id: params.id }),
  })

  return (
    <HydrationBoundary>
      <EditTransaction id={params.id} />
    </HydrationBoundary>
  )
}
