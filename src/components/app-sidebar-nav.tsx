
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
  Settings,
  Receipt,
  MessageSquareHeart,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Logo } from './logo'
import { Separator } from './ui/separator'

interface AppSidebarNavProps {
  isCollapsed?: boolean
  onLinkClick?: () => void;
}

export function AppSidebarNav({ isCollapsed = false, onLinkClick }: AppSidebarNavProps) {
  const pathname = usePathname()

  const mainNavItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/proposal-generator', icon: PenSquare, label: 'Proposal Generator' },
    { href: '/track', icon: Timer, label: 'Time Tracker' },
    { href: '/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/clients', icon: Users, label: 'Clients' },
    { href: '/invoices', icon: FileText, label: 'Invoices' },
    { href: '/expenses', icon: Receipt, label: 'Expenses' },
    { href: '/reports', icon: LineChart, label: 'Reports' },
    { href: '/referrals', icon: Gift, label: 'Referrals' },
  ];

  const secondaryNavItems = [
    { href: '/support/feedback', icon: MessageSquareHeart, label: 'Feedback' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  const linkClasses = (href: string) => cn(
    "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground",
    {
      'bg-sidebar-accent text-primary-foreground': pathname.startsWith(href),
    },
    isCollapsed && "h-9 w-9 justify-center rounded-lg text-muted-foreground md:h-8 md:w-8 px-0"
  )

  const mobileLinkClasses = (href: string) => cn(
    "flex items-center gap-4 rounded-lg px-3 py-3 text-sidebar-foreground/70 transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
     {
      'bg-sidebar-accent text-sidebar-accent-foreground scale-105 font-semibold': pathname.startsWith(href)
    }
  )
  
  const renderLink = (item: { href: string, icon: React.ElementType, label: string}) => {
    const Icon = item.icon;
    if (isCollapsed) {
       return (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                <Link href={item.href} className={linkClasses(item.href)}>
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        )
    }
    return (
        <Link
            key={item.href}
            href={item.href}
            className={mobileLinkClasses(item.href)}
            onClick={onLinkClick}
        >
            <Icon className="h-5 w-5" />
            {item.label}
        </Link>
    )
  }

  if (isCollapsed) {
    return (
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <Logo className="h-4 w-4 transition-all group-hover:scale-110 text-primary-foreground" />
                <span className="sr-only">OwFlex</span>
            </Link>
            {mainNavItems.map(renderLink)}
            <Separator className="my-2 bg-sidebar-border" />
            {secondaryNavItems.map(renderLink)}
        </nav>
    )
  }

  // Mobile / un-collapsed view
  return (
     <nav className="grid items-start gap-3 px-4 text-base font-medium">
        {mainNavItems.map(renderLink)}
        <Separator className="my-2 bg-sidebar-border/50" />
        {secondaryNavItems.map(renderLink)}
    </nav>
  )
}
