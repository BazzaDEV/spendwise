'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'

export async function getTagsForBudget({ budgetId }: { budgetId: number }) {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const tags = await db.tag.findMany({
    where: {
      transactions: {
        some: {
          transaction: {
            budgetId: budgetId,
          },
        },
      },
    },
  })

  return tags
}
