'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { NewTransactionSchema } from '@/lib/schemas'
import { Prisma } from '@prisma/client'
import { generateId } from 'lucia'
import { revalidatePath } from 'next/cache'

export async function getTransactionsForBudget({
  budgetId,
}: {
  budgetId: number
}) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const transactions = await db.transaction.findMany({
    where: {
      budgetId: budgetId,
    },
  })

  return transactions
}

export async function createTransaction(data: NewTransactionSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const newTransaction = await db.transaction.create({
    data: {
      id: generateId(15),
      amount: new Prisma.Decimal(data.amount),
      date: data.date,
      description: data.description,
      budgetId: data.budgetId,
    },
  })

  revalidatePath(`/budgets/${data.budgetId}`)

  return newTransaction
}

export async function deleteTransaction({
  transactionId,
}: {
  transactionId: string
}) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const deletedTransaction = await db.transaction.delete({
    where: {
      id: transactionId,
    },
  })

  revalidatePath(`/budgets/${deletedTransaction.budgetId}`)
  revalidatePath(`/transactions/${deletedTransaction.id}`)

  return deletedTransaction
}
