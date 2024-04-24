'use client'

import { Suspense } from 'react'
import { useHydration } from '@/hooks/use-hydration'
import { format } from 'date-fns'

export default function LocalTime({ date }: { date: Date | string | number }) {
  const hydrated = useHydration()
  return (
    <Suspense key={hydrated ? 'local' : 'utc'}>
      <time dateTime={new Date(date).toISOString()}>
        {format(new Date(date), 'yyyy/MM/dd')}
        {hydrated ? '' : ' (UTC)'}
      </time>
    </Suspense>
  )
}
