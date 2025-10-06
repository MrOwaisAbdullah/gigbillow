

"use client"

import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  CircleUser,
  PanelLeft,
  Zap,
} from "lucide-react"
import { usePathname } from 'next/navigation'
import React from "react"
import { AppSidebarNav } from "./app-sidebar-nav"
import { useAuth } from "./auth/auth-provider"
import { signOut } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useToken } from "./token/token-provider"
import { Logo } from "./logo"
import { useTour } from "./tour-provider"

export function AppHeader() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const { user } = useAuth();
  const { tokens, totalTokens, loading: tokensLoading, openDialog } = useToken();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { setOpen: setTourOpen } = useTour();

  const breadcrumbItems = segments.map((segment, index) => {
    // Exclude 'app' from breadcrumbs
    if (segment === 'app') return null;

    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    return (
      <React.Fragment key={href}>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href} className="capitalize">{segment}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </React.Fragment>
    )
  })

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-sidebar-border">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                 <Link
                    href="#"
                    className="group flex h-10 shrink-0 items-center justify-start gap-2 rounded-full text-lg font-semibold text-primary-foreground"
                >
                    <div className="bg-primary p-2 rounded-full">
                        <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                    </div>
                    <span>GigBillow</span>
                    <span className="sr-only">GigBillow</span>
                </Link>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AppSidebarNav isCollapsed={false} onLinkClick={() => setIsSheetOpen(false)} />
            </div>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbItems}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can add a search bar here if needed */}
      </div>
       <Button variant="outline" size="sm" onClick={openDialog}>
            <Zap className="mr-2 h-4 w-4 text-yellow-500" />
            {tokensLoading ? '...' : `${tokens}/${totalTokens}`} Tokens
       </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
             {user?.photoURL ? (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
             ) : (
                <CircleUser className="h-5 w-5" />
             )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support">Support</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTourOpen(true)}>
            Welcome Tour
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
