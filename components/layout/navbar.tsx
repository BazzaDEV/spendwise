import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUser, logout } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'

export default async function Navbar() {
  return (
    <div className="flex items-center justify-between">
      <span>Spendwise</span>
      <form action={logout}>
        <Button>Sign Out</Button>
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
