'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Clock,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
} from 'lucide-react'

interface SidebarProps {
  user: {
    email: string
    name?: string
  } | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Learnings', href: '/learnings', icon: BookOpen },
  { name: 'Flashcards', href: '/review', icon: Layers },
  { name: 'Sessions', href: '/sessions', icon: Clock },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('vibeless_user')
    localStorage.removeItem('vibeless_api_key')
    router.push('/')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <Zap className="h-4 w-4 text-background" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Vibeless</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
