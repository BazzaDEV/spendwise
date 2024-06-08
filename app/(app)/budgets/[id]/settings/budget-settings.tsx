'use client'

import { budgetQueries } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import BudgetSettingsForm from './budget-settings-form'

export default function BudgetSettings() {
  const params = useParams<{ id: string }>()
  const budgetId = Number(params.id)

  const { data } = useSuspenseQuery(budgetQueries.detail(budgetId))

  return <BudgetSettingsForm budget={data} />
}
