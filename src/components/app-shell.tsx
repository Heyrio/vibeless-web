'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'

interface User {
  id: string
  email: string
  name?: string
  apiKey: string
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('vibeless_user')
    if (!stored) {
      router.push('/')
      return
    }
    setUser(JSON.parse(stored))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <main className="pl-64">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  )
}
