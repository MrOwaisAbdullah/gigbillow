'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useTheme } from "@/hooks/use-theme";

export function LandingHeader() {
  const { user } = useAuth();
  const { toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link
          href="/"
          className="mr-auto flex items-center gap-2"
          prefetch={false}
        >
          <Logo className="h-8 w-8 text-primary" />
          <span className="hidden min-[320px]:inline font-bold text-lg text-primary">
            OwFlex
          </span>
        </Link>
        <nav className="hidden sm:flex flex-1">
          {/* Can add nav links here later */}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
            className="h-10 w-10"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {user === null ? (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
