import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login | Spendwise',
}

export default async function Page() {
  return (
    <div>
      <h1>Login</h1>
      <div>
        <Button
          variant="default"
          asChild
        >
          <Link href="/login/google">Login with Google</Link>
        </Button>
      </div>
    </div>
  )
}
