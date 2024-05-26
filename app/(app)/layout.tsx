import Navbar from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getUser } from '@/lib/auth/actions'
import QueryProvider from '@/providers/query-provider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <QueryProvider>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col p-4">
          <Navbar />
          <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col py-10">
            {children}
          </div>
        </div>
        <Toaster richColors />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  )
}
