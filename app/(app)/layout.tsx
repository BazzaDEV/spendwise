import Navbar from '@/components/layout/navbar'
import { getUser } from '@/lib/auth/actions'
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
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  )
}
