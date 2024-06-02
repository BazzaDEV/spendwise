import {
  getBudget,
  getBudgets,
  getBudgetsWithStatistics,
  getTimePeriods,
} from '@/api/budgets'
import { getOwedReimbursements } from '@/api/reimbursements'
import { getTagsForBudget } from '@/api/tags'
import { getTransaction, getTransactionsForBudget } from '@/api/transactions'
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  queryOptions,
} from '@tanstack/react-query'

/**********************************************************************/

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // per default, only successful Queries are included,
        // this includes pending Queries as well
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**********************************************************************/

export const periodQueries = {
  all: () => ['time-periods'],
  list: () =>
    queryOptions({
      queryKey: [...periodQueries.all(), 'list'],
      queryFn: () => getTimePeriods(),
    }),
}

export const tagQueries = {
  all: () => ['tags'],
  forBudget: (id: number) =>
    queryOptions({
      queryKey: [...tagQueries.all(), 'budget', id],
      queryFn: () => getTagsForBudget({ budgetId: id }),
    }),
}

export const budgetQueries = {
  all: () => ['budgets'],
  lists: () =>
    queryOptions({
      queryKey: [...budgetQueries.all(), 'list'],
      queryFn: () => getBudgets(),
    }),
  list: (id: number) =>
    queryOptions({
      queryKey: [...budgetQueries.all(), 'list', id],
      queryFn: () => getBudget({ id }),
    }),
  statistics: () =>
    queryOptions({
      queryKey: [...budgetQueries.all(), 'statistics'],
      queryFn: () => getBudgetsWithStatistics(),
    }),
}

export const transactionQueries = {
  all: () => ['transactions'],
  forBudget: (id: number) =>
    queryOptions({
      queryKey: [...transactionQueries.all(), 'budget', id],
      queryFn: () => getTransactionsForBudget({ budgetId: id }),
    }),
  details: () => [...transactionQueries.all(), 'detail'],
  detail: (id: string) =>
    queryOptions({
      queryKey: [...transactionQueries.details(), id],
      queryFn: () => getTransaction({ id }),
    }),
}

export const reimbursementQueries = {
  all: () => ['reimbursements'],
  owed: () =>
    queryOptions({
      queryKey: [...reimbursementQueries.all(), 'owed'],
      queryFn: () => getOwedReimbursements(),
    }),
}
