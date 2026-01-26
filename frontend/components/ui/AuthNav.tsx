// === components/ui/AuthNav.tsx ===

import { getUser } from '@/lib/auth/lucia'
import { logoutAction } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export async function AuthNav() {
  const { user } = await getUser()

  if (!user) {
    return (
      <nav className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground hidden sm:block">
        {user.name || user.email}
      </span>
      {user.role === 'ADMIN' && (
        <Link href="/admin/dashboard">
          <Button variant="ghost">Admin</Button>
        </Link>
      )}
      <form action={logoutAction}>
        <Button type="submit" variant="ghost">
          Logout
        </Button>
      </form>
    </nav>
  )
}
