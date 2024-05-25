import { getBudgets } from '@/api/budgets'
import { getTagsForBudget } from '@/api/tags'
import { getTransaction } from '@/api/transactions'
import { queryOptions } from '@tanstack/react-query'

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
  list: () =>
    queryOptions({
      queryKey: ['budgets', 'list'],
      queryFn: () => getBudgets(),
    }),
  details: () => [...budgetQueries.all(), 'detail'],
  detail: (id: number) =>
    queryOptions({
      queryKey: [...budgetQueries.details(), id],
    }),
}

export const transactionQueries = {
  all: () => ['transactions'],
  details: () => [...transactionQueries.all(), 'detail'],
  detail: (id: string) =>
    queryOptions({
      queryKey: [...transactionQueries.details(), id],
      queryFn: () => getTransaction({ id }),
    }),
}
