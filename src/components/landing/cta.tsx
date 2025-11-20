'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function LandingCTA() {
  const { user } = useAuth();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 border-t">
      <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Ready to streamline your freelance life?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Sign up today and get 10 free tokens. No credit card required.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          {user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/register">Get Started Now</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
