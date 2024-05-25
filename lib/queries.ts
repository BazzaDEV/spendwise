import { getBudgets } from '@/api/budgets'
import { getTagsForBudget } from '@/api/tags'
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
  all: () =>
    queryOptions({
      queryKey: ['budgets'],
      queryFn: () => getBudgets(),
    }),
}
