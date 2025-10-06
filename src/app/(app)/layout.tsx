

'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { FloatingTrackerButton } from '@/components/floating-tracker-button';
import { AuthProvider, useAuth } from '@/components/auth/auth-provider';
import { TokenProvider } from '@/components/token/token-provider';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { WelcomeTour } from '@/components/welcome-tour';
import { TourProvider, useTour } from '@/components/tour-provider';

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading, isNewUser } = useAuth();
  const searchParams = useSearchParams();
  const { setOpen, isTourOpen } = useTour();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isNewUser) {
      setOpen(true);
    }
  }, [isNewUser, setOpen]);


  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <FirebaseErrorListener />
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
        <AppHeader />
        <main className="flex-1 items-start gap-4 p-4 pb-24 sm:px-6 sm:py-0 md:gap-8 w-full md:pb-24 overflow-x-hidden">
          {children}
        </main>
      </div>
      <FloatingTrackerButton />
      <WelcomeTour open={isTourOpen} onOpenChange={setOpen} />
    </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TokenProvider>
        <TourProvider>
          <AppContent>{children}</AppContent>
        </TourProvider>
      </TokenProvider>
    </AuthProvider>
  );
}
