'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { newBudgetSchema } from '@/lib/schemas'
import { Budget, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getBudgets() {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
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

  return budgets
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
      monthlyLimits: {
        where: {
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      },
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

  const mtdLimit = budget.monthlyLimits[0].limit.toNumber()

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

export async function createBudget(data: newBudgetSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const { monthlyLimit, name } = data

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
      name: name,
      monthlyLimits: {
        create: {
          date: new Date(),
          limit: new Prisma.Decimal(monthlyLimit),
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
