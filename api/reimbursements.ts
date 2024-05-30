'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'
import { formatCurrency2 } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { sum, unique } from 'radash'
import { cache } from 'react'

export const getOwedReimbursements = cache(async () => {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const totals = await db.reimbursement.groupBy({
    by: ['payerName'],
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    where: {
      transaction: {
        payerId: user.id,
      },
      received: false,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  })

  const reimbursements = await db.reimbursement.findMany({
    where: {
      transaction: {
        payerId: user.id,
      },
      received: false,
    },
    include: {
      transaction: true,
    },
    orderBy: [
      {
        payerName: 'asc',
      },
      {
        transaction: {
          date: 'desc',
        },
      },
    ],
  })

  const total = sum(reimbursements.map((r) => r.amount.toNumber()))

  return {
    total: {
      value: total,
      formatted: formatCurrency2(total),
    },
    data: totals.map((t) => ({
      name: t.payerName,
      amount: t._sum.amount?.toNumber() || 0,
      reimbursements: reimbursements
        .filter((r) => r.payerName === t.payerName)
        .map((r) => ({
          ...r,
          amount: r.amount.toNumber(),
          transaction: {
            ...r.transaction,
            amount: r.transaction.amount.toNumber(),
          },
        })),
    })),
  }
})

export const settleReimbursementsById = cache(async (ids: string[]) => {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const reimbursements = await db.reimbursement.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      transaction: true,
    },
  })

  const affectedBudgets = unique(
    reimbursements.map((r) => r.transaction.budgetId),
  )

  const affectedTransactions = unique(
    reimbursements.map((r) => r.transactionId),
  )

  await db.reimbursement.updateMany({
    where: {
      id: {
        in: ids,
      },
      transaction: {
        payerId: user.id,
      },
    },
    data: {
      received: true,
    },
  })

  affectedBudgets.forEach((id) => revalidatePath(`/budgets/${id}`))
  affectedTransactions.forEach((id) => revalidatePath(`/transactions/${id}`))
})
