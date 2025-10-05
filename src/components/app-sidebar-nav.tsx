'use client'

import Link from 'next/link'
import {
  LayoutGrid,
  FolderKanban,
  Users,
  FileText,
  Timer,
  LineChart,
  PenSquare,
  Gift,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Logo } from './logo'

interface AppSidebarNavProps {
  isCollapsed?: boolean
  onLinkClick?: () => void;
}

export function AppSidebarNav({ isCollapsed = false, onLinkClick }: AppSidebarNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/clients', icon: Users, label: 'Clients' },
    { href: '/invoices', icon: FileText, label: 'Invoices' },
    { href: '/track', icon: Timer, label: 'Time Tracker' },
    { href: '/proposal-generator', icon: PenSquare, label: 'Proposal Generator' },
    { href: '/referrals', icon: Gift, label: 'Referrals' },
    { href: '/reports', icon: LineChart, label: 'Reports' },
  ]

  const linkClasses = (href: string) => cn(
    "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground",
    {
      'bg-sidebar-accent text-primary-foreground': pathname.startsWith(href) && href !== '/dashboard',
      'bg-sidebar-accent text-primary-foreground': pathname === '/dashboard' && href === '/dashboard'
    },
    isCollapsed && "h-9 w-9 justify-center rounded-lg text-muted-foreground md:h-8 md:w-8 px-0"
  )

  const mobileLinkClasses = (href: string) => cn(
    "flex items-center gap-4 rounded-lg px-3 py-3 text-sidebar-foreground/70 transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
     {
      'bg-sidebar-accent text-sidebar-accent-foreground scale-105 font-semibold': (pathname.startsWith(href) && href !== '/dashboard') || (pathname === '/dashboard' && href === '/dashboard')
    }
  )

  if (isCollapsed) {
    return (
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <Logo className="h-4 w-4 transition-all group-hover:scale-110 text-primary-foreground" />
                <span className="sr-only">GigBillow</span>
            </Link>
            {navItems.map(({ href, icon: Icon, label }) =>
                <Tooltip key={href}>
                    <TooltipTrigger asChild>
                    <Link href={href} className={linkClasses(href)}>
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
            )}
        </nav>
    )
  }

  // Mobile / un-collapsed view
  return (
     <nav className="grid items-start gap-3 px-4 text-base font-medium">
        {navItems.map(({ href, icon: Icon, label }) => (
            <Link
                key={href}
                href={href}
                className={mobileLinkClasses(href)}
                onClick={onLinkClick}
            >
                <Icon className="h-5 w-5" />
                {label}
            </Link>
        ))}
    </nav>
  )
}
