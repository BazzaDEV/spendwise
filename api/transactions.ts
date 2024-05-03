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
    include: {
      tags: {
        include: {
          Tag: true,
        },
      },
    },
  })

  return transactions.map((transaction) => ({
    ...transaction,
    tags: transaction.tags.map((tag) => tag.Tag),
  }))
}

export async function createTransaction(data: NewTransactionSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const existingTags = data.tags.filter((t) => t.id !== undefined)
  const newTags = data.tags.filter((t) => t.id === undefined)

  await db.tag.createMany({ data: newTags, skipDuplicates: true })

  const tagLabels = [...existingTags, ...newTags].map((t) => ({
    label: t.label,
  }))

  const tags = await db.tag.findMany({
    where: {
      OR: tagLabels,
    },
  })

  const newTransaction = await db.transaction.create({
    data: {
      amount: new Prisma.Decimal(data.amount),
      date: data.date,
      description: data.description,
      budgetId: data.budgetId,
      tags: {
        create: [
          ...tags.map((tag) => ({
            Tag: {
              connect: {
                id: tag.id,
              },
            },
          })),
        ],
      },
    },
    include: {
      tags: {
        include: {
          Tag: true,
        },
      },
    },
  })

  revalidatePath(`/budgets/${data.budgetId}`)

  return { ...newTransaction, tags: newTransaction.tags.map((tag) => tag.Tag) }
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
