'use server'

import { getUserOrRedirect } from '@/lib/auth/actions'
import db from '@/lib/db'

export async function getLocalUsers() {
  const user = await getUserOrRedirect()

  if (!user) {
    return {
      error: 'Unauthenticated',
    }
  }

  const localUsers = await db.localUser.findMany({
    where: {
      ownerId: user.id,
    },
  })

  return localUsers
}
