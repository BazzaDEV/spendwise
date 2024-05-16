import Navbar from '@/components/layout/navbar'
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
      <div className="mx-auto min-h-screen max-w-screen-xl p-4">
        <Navbar />
        <div className="py-12">{children}</div>
      </div>
    </Providers>
  )
}
