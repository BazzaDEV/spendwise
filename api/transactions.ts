'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { EditTransactionSchema, NewTransactionSchema } from '@/lib/schemas'
import { Prisma, Transaction } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { diff, fork } from 'radash'

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

async function updateTagsForTransaction(
  transactionId: string,
  updatedTags: { id?: string; label: string }[],
) {
  // Fetch the original tags associated with the transaction
  const originalTags = (
    await db.tagOnTransaction.findMany({
      where: {
        transactionId: transactionId,
      },
      include: {
        tag: true,
      },
    })
  ).map((tag) => tag.tag)

  // Separate brand-new tags, and existing tags in the database
  const [createdTags, existingTags] = fork(
    updatedTags,
    (t) => t.id === undefined,
  )

  // Tags that were removed from the transaction
  const removedTags = diff(originalTags, existingTags)

  // Tags that were added to the transaction
  const addedTags = diff(existingTags, originalTags)

  // Create new tags in the database
  // Add them to the transaction
  // await Promise.all(createdTags.map(async t => {
  //   const existingTag = await db.tagOnTransaction.findUnique({
  //     where: {
  //       transaction: {
  //         budgetId:
  //       }
  //     }
  //   })
  // }))
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
