import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import NewBudgetForm from './new-budget-form'
import { getTimePeriods } from '@/api/budgets'

export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['time-periods'],
    queryFn: () => getTimePeriods(),
  })

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold tracking-tighter">
        Create a new budget
      </h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewBudgetForm />
      </HydrationBoundary>
    </div>
  )
}
