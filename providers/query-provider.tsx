// In Next.js, this file would be called: app/providers.jsx
'use client'

import { getQueryClient } from '@/lib/queries'
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { QueryClientProvider } from '@tanstack/react-query'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
