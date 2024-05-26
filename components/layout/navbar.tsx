import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUser, logout } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PiggyBankIcon } from 'lucide-react'

const pages = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/budgets',
    label: 'Budgets',
  },

  {
    href: '/transactions',
    label: 'Transactions',
  },
  {
    href: '/reimbursements',
    label: 'Reimbursements',
  },
]

export default async function Navbar() {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        asChild
      >
        <Link
          href="/dashboard"
          className="mr-4 inline-flex items-center gap-1.5"
        >
          <PiggyBankIcon className="size-6" /> spendwise
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <Button
            key={page.href}
            variant="ghost"
            asChild
          >
            <Link href={page.href}>{page.label}</Link>
          </Button>
        ))}
      </div>
      <form action={logout}>
        <Button variant="secondary">Sign Out</Button>
      </form>
    </div>
  )
}

export async function UserButton() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const { firstName, lastName } = user

  const initials = (firstName[0] + lastName[0]).toUpperCase()

  return (
    <Avatar>
      <AvatarImage src={user.picture as string} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
