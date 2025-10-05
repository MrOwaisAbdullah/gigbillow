'use client'

import Link from 'next/link'
import {
  LayoutGrid,
  FolderKanban,
  Users,
  FileText,
  Timer,
  LineChart,
  Package2,
  PenSquare,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface AppSidebarNavProps {
  isCollapsed?: boolean
}

export function AppSidebarNav({ isCollapsed = false }: AppSidebarNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/clients', icon: Users, label: 'Clients' },
    { href: '/invoices', icon: FileText, label: 'Invoices' },
    { href: '/track', icon: Timer, label: 'Time Tracker' },
    { href: '/proposal-generator', icon: PenSquare, label: 'Proposal Generator' },
    { href: '/reports', icon: LineChart, label: 'Reports' },
  ]

  const linkClasses = (href: string) => cn(
    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
    {
      'bg-accent text-accent-foreground': pathname.startsWith(href) && href !== '/',
      'bg-accent text-accent-foreground': pathname === '/' && href === '/dashboard'
    },
    { 'justify-start gap-4 px-2.5': !isCollapsed }
  )

  return (
    <nav className={cn("flex flex-col items-center gap-4 px-2 sm:py-5", { 'items-start': !isCollapsed })}>
      <Link
        href="#"
        className={cn("group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base", { 'w-auto px-4': !isCollapsed })}
      >
        <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
        {!isCollapsed && <span className="sr-only">GigBillow</span>}
      </Link>
      {navItems.map(({ href, icon: Icon, label }) =>
        isCollapsed ? (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link href={href} className={linkClasses(href)}>
                <Icon className="h-5 w-5" />
                <span className="sr-only">{label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ) : (
          <Link key={href} href={href} className={linkClasses(href)}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        )
      )}
    </nav>
  )
}
