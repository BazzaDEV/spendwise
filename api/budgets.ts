'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'

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
