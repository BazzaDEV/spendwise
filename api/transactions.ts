'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import {
  EditTransactionSchema,
  NewTransactionSchema,
  UpdateTransactionSchema,
} from '@/lib/schemas'
import { Prisma, Transaction } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { diff, fork, omit, unique } from 'radash'

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

  const tagLabels = unique(data.tags.map((t) => t.label))

  const existingTags = await db.tag.findMany({
    where: {
      label: {
        in: tagLabels,
      },
      budgetId: data.budgetId,
    },
  })

  const existingTagLabels = existingTags.map((t) => t.label)
  const newTagLabels = diff(tagLabels, existingTagLabels)

  const newTags = await db.tag.createManyAndReturn({
    data: newTagLabels.map((l) => ({ label: l, budgetId: data.budgetId })),
  })

  const tags = [...existingTags, ...newTags]

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

  return db.$transaction(async (prisma) => {
    const transactionId = data.id

    // Retrieve the existing transaction to check if the budget has changed
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { budget: true },
    })

    if (!existingTransaction) {
      throw new Error('Transaction not found')
    }

    const oldBudgetId = existingTransaction.budgetId
    const newBudgetId = data.budgetId
    const budgetChanged = oldBudgetId !== newBudgetId

    // Update the transaction details
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        budgetId: newBudgetId,
        date: data.date,
        description: data.description,
        amount:
          typeof data.amount === 'string'
            ? parseFloat(data.amount)
            : data.amount,
      },
    })

    // If the budget has changed, remove all TagOnTransaction records for the transaction
    if (budgetChanged) {
      await prisma.tagOnTransaction.deleteMany({
        where: {
          transactionId: transactionId,
        },
      })
    }

    // Update or create tags and ensure they are scoped to the correct budget
    const tagsOnTransaction = await Promise.all(
      data.tags.map(async (tag) => {
        let tagId = tag.id

        // Check if the tag with the same label exists for the new budget
        const existingTag = await prisma.tag.findFirst({
          where: {
            label: tag.label,
            budgetId: newBudgetId,
          },
        })

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create a new tag for the new budget
          const newTag = await prisma.tag.create({
            data: {
              label: tag.label,
              budgetId: newBudgetId,
            },
          })
          tagId = newTag.id
        }

        // Create or update the tag on the transaction
        return prisma.tagOnTransaction.upsert({
          where: {
            transactionId_tagId: {
              transactionId: transactionId,
              tagId: tagId,
            },
          },
          update: {},
          create: {
            transactionId: transactionId,
            tagId: tagId,
          },
        })
      }),
    )

    // Update or create reimbursements
    const reimbursements = await Promise.all(
      data.reimbursements.map((reimbursement) => {
        return prisma.reimbursement.upsert({
          where: { id: reimbursement.id || '' },
          update: {
            payerName: reimbursement.payerName,
            amount: reimbursement.amount,
            note: reimbursement.note,
            transactionId: transactionId,
          },
          create: {
            payerName: reimbursement.payerName,
            amount: reimbursement.amount,
            note: reimbursement.note,
            transactionId: transactionId,
          },
        })
      }),
    )

    console.log('Done')
  })
}

export async function updateTransactions({
  ids,
  data,
}: {
  ids: string[]
  data: UpdateTransactionSchema
}) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  return db.$transaction(async (prisma) => {
    await Promise.all(
      ids.map(async (transactionId) => {
        // Retrieve the existing transaction to check if the budget has changed
        const existingTransaction = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: { budget: true, tags: { include: { tag: true } } },
        })

        if (!existingTransaction) {
          throw new Error('Transaction not found')
        }

        const oldBudgetId = existingTransaction.budgetId
        const newBudgetId = data.budgetId
        const budgetChanged = !newBudgetId || oldBudgetId !== newBudgetId

        // Update the transaction details
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            ...omit(data, ['tags', 'reimbursements']),
          },
        })

        // If the budget has changed, remove all TagOnTransaction records for the transaction
        if (budgetChanged) {
          await prisma.tagOnTransaction.deleteMany({
            where: {
              transactionId: transactionId,
            },
          })

          const existingTags = existingTransaction.tags.map((t) => t.tag)

          const tagsOnTransaction = await Promise.all(
            existingTags.map(async (tag) => {
              let tagId = tag.id

              // Check if the tag with the same label exists for the new budget
              const existingTag = await prisma.tag.findFirst({
                where: {
                  label: tag.label,
                  budgetId: newBudgetId,
                },
              })

              if (existingTag) {
                tagId = existingTag.id
              } else {
                // Create a new tag for the new budget
                const newTag = await prisma.tag.create({
                  data: {
                    label: tag.label,
                    budgetId: newBudgetId,
                  },
                })
                tagId = newTag.id
              }

              // Create or update the tag on the transaction
              return prisma.tagOnTransaction.upsert({
                where: {
                  transactionId_tagId: {
                    transactionId: transactionId,
                    tagId: tagId,
                  },
                },
                update: {},
                create: {
                  transactionId: transactionId,
                  tagId: tagId,
                },
              })
            }),
          )
        }
      }),
    )
  })
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
