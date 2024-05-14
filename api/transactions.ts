'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { EditTransactionSchema, NewTransactionSchema } from '@/lib/schemas'
import { Prisma, Transaction } from '@prisma/client'
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
          tag: true,
        },
      },
    },
  })

  return transactions.map((transaction) => ({
    ...transaction,
    tags: transaction.tags.map((tag) => tag.tag),
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
      payerId: user.id,
      budgetId: data.budgetId,
      tags: {
        create: [
          ...tags.map((tag) => ({
            tag: {
              connect: {
                id: tag.id,
              },
            },
          })),
        ],
      },
      reimbursements: {
        create: [
          ...data.reimbursements.map((reimbursement) => ({
            ...reimbursement,
            amount: new Prisma.Decimal(reimbursement.amount),
          })),
        ],
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      reimbursements: true,
    },
  })

  revalidatePath(`/budgets/${data.budgetId}`)

  return { ...newTransaction, tags: newTransaction.tags.map((tag) => tag.tag) }
}

export async function updateTransaction(data: EditTransactionSchema) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  // Implement logic here
  // Should grab the "current" transaction's tags and reimbursements
  // Then determine what has been changed, updated, and removed
  // Then perform the appropriate actions to match the database with
  // the new changes
}

export async function getTransaction(data: Pick<Transaction, 'id'>) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const transaction = await db.transaction.findUnique({
    where: {
      id: data.id,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      reimbursements: true,
    },
  })

  if (!transaction) {
    throw new Error('Transaction does not exist')
  }

  return {
    ...transaction,
    amount: transaction.amount.toNumber(),
    tags: transaction.tags.map((tag) => tag.tag),
    reimbursements: transaction.reimbursements.map((r) => ({
      ...r,
      amount: r.amount.toNumber(),
    })),
  }
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
