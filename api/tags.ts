'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'

export async function getTagsForBudget({ budgetId }: { budgetId: number }) {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const tags = await db.tag.findMany({
    where: {
      budgetId: budgetId,
    },
  })

  return tags
}
