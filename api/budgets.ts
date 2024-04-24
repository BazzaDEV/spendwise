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
  })

  return budgets
}

export async function createBudget(data: newBudgetSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
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
