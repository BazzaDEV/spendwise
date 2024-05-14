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
      budgetId: budgetId,
    },
  })

  return tags
}

export async function getTags() {
  const user = await getUserOrRedirect()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const tags = await db.tag.findMany()

  return tags
}
