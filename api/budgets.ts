'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { newBudgetSchema } from '@/lib/schemas'
import { Prisma } from '@prisma/client'

export async function getBudgets() {
  const user = await getUserOrRedirect()

  if (!user) {
    return null
  }

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
    },
  })

  return budgets
}

export async function createBudget(data: newBudgetSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return null
  }

  const { monthlyLimit, name } = data

  const newBudget = await db.budget.create({
    data: {
      userId: user.id,
      name: name,
      monthlyLimits: {
        create: {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          limit: new Prisma.Decimal(monthlyLimit),
        },
      },
    },
  })

  return newBudget
}
