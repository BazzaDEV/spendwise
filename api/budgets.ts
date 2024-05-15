'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { NewBudgetSchema } from '@/lib/schemas'
import { Budget } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getBudgets() {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
    },
    // include: {
    //   monthlyLimits: true,
    //   transactions: {
    //     include: {
    //       reimbursements: true,
    //     },
    //   },
    // },
  })

  return budgets.map((budget) => ({
    ...budget,
    reserve: budget.reserve.toNumber(),
  }))
}

export async function getTimePeriods() {
  const timePeriods = await db.timePeriod.findMany()

  return timePeriods
}

export async function getBudgetDetails(data: Pick<Budget, 'id'>) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const currentDate = new Date()
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  const budget = await db.budget.findUnique({
    where: {
      id: data.id,
      userId: user.id,
    },
    include: {
      transactions: {
        where: {
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        include: {
          reimbursements: true,
        },
      },
      budgetLimit: true,
    },
  })

  if (!budget) {
    return {
      error: "Budget does not exist or you don't have permission to access it.",
    }
  }

  const mtdGross = budget.transactions.reduce(
    (prev, curr) => prev + curr.amount.toNumber(),
    0,
  )

  const mtdActual = budget.transactions.reduce(
    (prev, curr) =>
      prev +
      curr.amount.toNumber() -
      curr.reimbursements.reduce(
        (prev2, curr2) => prev2 + curr2.amount.toNumber(),
        0,
      ),
    0,
  )

  const mtdLimit = budget.budgetLimit!.amount.toNumber()

  const mtdProgress = (mtdActual / mtdLimit) * 100

  console.log({ mtdGross, mtdActual, mtdLimit, mtdProgress })

  return {
    budgetId: budget.id,
    statistics: {
      mtd: firstDayOfMonth,
      mtdGross,
      mtdActual,
      mtdLimit,
      mtdProgress,
    },
  }
}

export async function createBudget(data: NewBudgetSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const existingBudget = await db.budget.findFirst({
    where: {
      userId: user.id,
      name: data.name,
    },
  })

  if (existingBudget) {
    return {
      error: 'A budget with this name already exists.',
    }
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

  revalidatePath(`/home`)

  return newBudget
}

export async function getBudget(data: Pick<Budget, 'id'>) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const budget = await db.budget.findFirst({
    where: {
      id: data.id,
    },
  })

  if (!budget) {
    return {
      error: 'Budget does not exist.',
    }
  }

  if (budget.userId !== user.id) {
    return {
      error: 'This budget does not belong to you.',
    }
  }

  return budget
}
