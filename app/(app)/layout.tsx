import Navbar from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getUser } from '@/lib/auth/actions'
import Providers from '@/providers/query-provider'
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
    <Providers>
      <TooltipProvider>
        <div className="min-h-screen p-4">
          <Navbar />
          <div>{children}</div>
        </div>
        <Toaster richColors />
      </TooltipProvider>
    </Providers>
  )
}
