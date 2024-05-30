'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { NewBudgetSchema } from '@/lib/schemas'
import { Budget } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export const getBudgets = cache(async () => {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
    },
  })

  return budgets.map((budget) => ({
    ...budget,
    reserve: budget.reserve.toNumber(),
  }))
})

export const getTimePeriods = cache(async () => {
  const timePeriods = await db.timePeriod.findMany()

  return timePeriods
})

export const getBudgetsWithStatistics = cache(async () => {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const currentDate = new Date()
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1) // January 1st of the current year
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999) // December 31st of the current year

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
    },
    include: {
      transactions: {
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        include: {
          reimbursements: true,
        },
      },
      budgetLimit: {
        include: {
          timePeriod: true,
        },
      },
    },
  })

  return budgets.map((budget) => {
    let startDate: Date
    let endDate: Date

    // Determine the start and end dates based on the time period
    if (budget.budgetLimit?.timePeriod?.name === 'Yearly') {
      startDate = startOfYear
      endDate = endOfYear
    } else if (budget.budgetLimit?.timePeriod?.name === 'Monthly') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) // First day of the current month
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ) // Last day of the current month
    } else {
      throw new Error('Unsupported budget time period')
    }

    // Filter transactions by the determined date range
    const filteredTransactions = budget.transactions.filter(
      (transaction) =>
        transaction.date >= startDate && transaction.date <= endDate,
    )

    const mtdGross = filteredTransactions.reduce(
      (prev, curr) => prev + curr.amount.toNumber(),
      0,
    )

    const mtdActual = filteredTransactions.reduce(
      (prev, curr) =>
        prev +
        curr.amount.toNumber() -
        curr.reimbursements.reduce(
          (prev2, curr2) => prev2 + curr2.amount.toNumber(),
          0,
        ),
      0,
    )

    const mtdLimit = budget.budgetLimit.amount.toNumber()

    const mtdProgress = (mtdActual / mtdLimit) * 100

    return {
      id: budget.id,
      name: budget.name,
      statistics: {
        periodStart: startDate,
        periodEnd: endDate,
        mtdGross,
        mtdActual,
        mtdLimit,
        mtdProgress,
      },
    }
  })
})

export const getBudgetDetails = cache(async (data: Pick<Budget, 'id'>) => {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const currentDate = new Date()
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1) // January 1st of the current year
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999) // December 31st of the current year

  const budget = await db.budget.findUnique({
    where: {
      id: data.id,
      userId: user.id,
    },
    include: {
      transactions: {
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        include: {
          reimbursements: true,
        },
      },
      budgetLimit: {
        include: {
          timePeriod: true,
        },
      },
    },
  })

  if (!budget) {
    return {
      error: "Budget does not exist or you don't have permission to access it.",
    }
  }

  let startDate: Date
  let endDate: Date

  // Determine the start and end dates based on the time period
  if (budget.budgetLimit?.timePeriod?.name === 'Yearly') {
    startDate = startOfYear
    endDate = endOfYear
  } else if (budget.budgetLimit?.timePeriod?.name === 'Monthly') {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) // First day of the current month
    endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ) // Last day of the current month
  } else {
    return {
      error: 'Unsupported budget time period.',
    }
  }

  // Filter transactions by the determined date range
  const filteredTransactions = budget.transactions.filter(
    (transaction) =>
      transaction.date >= startDate && transaction.date <= endDate,
  )

  const mtdGross = filteredTransactions.reduce(
    (prev, curr) => prev + curr.amount.toNumber(),
    0,
  )

  const mtdActual = filteredTransactions.reduce(
    (prev, curr) =>
      prev +
      curr.amount.toNumber() -
      curr.reimbursements.reduce(
        (prev2, curr2) => prev2 + curr2.amount.toNumber(),
        0,
      ),
    0,
  )

  const mtdLimit = budget.budgetLimit.amount.toNumber()

  const mtdProgress = (mtdActual / mtdLimit) * 100

  return {
    budgetId: budget.id,
    statistics: {
      periodStart: startDate,
      periodEnd: endDate,
      mtdGross,
      mtdActual,
      mtdLimit,
      mtdProgress,
    },
  }
})

export async function createBudget(data: NewBudgetSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const existingBudget = await db.budget.findFirst({
    where: {
      userId: user.id,
      name: data.name,
    },
  })

  if (existingBudget) {
    throw new Error('You already have a budget with this name.')
  }

  const newBudget = await db.budget.create({
    data: {
      userId: user.id,
      name: data.name,
      budgetLimit: {
        create: {
          timePeriodId: data.budgetLimit.periodId,
          amount: data.budgetLimit.amount,
        },
      },
    },
  })

  revalidatePath(`/dashboard`)

  return newBudget
}

export const getBudget = cache(async (data: Pick<Budget, 'id'>) => {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const budget = await db.budget.findFirst({
    where: {
      id: Number(data.id),
    },
  })

  if (!budget || user.id !== budget.userId) {
    throw new Error(
      'Budget does not exist or you do not have permission to access it.',
    )
  }

  return budget
})

export async function getBudgetTransactions(id: number) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const transactions = await db.transaction.findMany({
    where: {
      budgetId: id,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  return transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(),
    tags: transaction.tags.map((tag) => tag.tag),
  }))
}
