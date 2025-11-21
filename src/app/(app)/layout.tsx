

'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { FloatingTrackerButton } from '@/components/floating-tracker-button';
import { AuthProvider, useAuth } from '@/components/auth/auth-provider';
import { TokenProvider } from '@/components/token/token-provider';
import { Loader2, Bug } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SecurityErrorListener } from '@/components/SecurityErrorListener';
import { WelcomeTour } from '@/components/welcome-tour';
import { TourProvider, useTour } from '@/components/tour-provider';
import { TimedFeedbackDialog } from '@/components/feedback/timed-feedback-dialog';
import { Logo } from '@/components/logo';

const FEEDBACK_TIMER_DURATION = 1000 * 60 * 15; // 15 minutes
const FEEDBACK_STORAGE_KEY = 'gigbillow-feedback-prompt-dismissed';

const loadingMessages: { [key: string]: string[] } = {
  invoices: [
    'Brewing some fresh invoices...',
    'Calculating your earnings...',
    'Getting those numbers crunched...',
    'Polishing your payment links...',
  ],
  projects: [
    'Organizing your project boards...',
    'Assembling your creative briefs...',
    'Checking project statuses...',
    'Lining up your next big thing...',
  ],
  proposals: [
    'Warming up the AI copywriter...',
    'Finding winning words...',
    'Crafting your next job-winning proposal...',
    'Getting ready to impress clients...',
  ],
  reports: [
    'Analyzing your performance...',
    'Generating insightful charts...',
    'Turning data into dollars...',
    'Preparing your business overview...',
  ],
  track: [
    'Winding up the timers...',
    'Syncing your billable hours...',
    'Making every second count...',
    'Preparing the stopwatch...',
  ],
  default: [
    'Loading your workspace...',
    'Polishing the pixels...',
    'Reticulating splines...',
    'Empowering your freelance journey...',
    'Streamlining your hustle...',
  ],
};


function AppContent({ children }: { children: React.ReactNode }) {
  const { loading, isNewUser } = useAuth();
  const searchParams = useSearchParams();
  const { setOpen, isTourOpen } = useTour();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('Loading your workspace...');
  const pathname = usePathname();

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

  useEffect(() => {
    const dialogDismissed = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (dialogDismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setShowFeedbackDialog(true);
    }, FEEDBACK_TIMER_DURATION);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) {
      const pageKey = Object.keys(loadingMessages).find(key => pathname.includes(key)) || 'default';
      const messages = loadingMessages[pageKey];
      let messageIndex = 0;
      setCurrentMessage(messages[messageIndex]);

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setCurrentMessage(messages[messageIndex]);
      }, 2500); // Change message every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [loading, pathname]);


  const handleDialogClose = (dontShowAgain: boolean) => {
    setShowFeedbackDialog(false);
    if (dontShowAgain) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, 'true');
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-secondary/50 dark:bg-secondary/30">
        <div className="flex-grow flex flex-col items-center justify-center gap-6">
            <Logo className="h-16 w-16 text-primary" />
            <div className='flex items-center gap-4 text-muted-foreground'>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className='text-lg'>{currentMessage}</p>
            </div>
        </div>
        <div className="pb-4 text-sm text-muted-foreground">
            Made with ❤️ by <a href="https://owaisabdullah.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Owais Abdullah</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/50 dark:bg-secondary/30">
      <SecurityErrorListener />
      <AppSidebar />
      <div className="flex flex-col min-h-screen sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
        <footer className="mt-auto py-3 px-4 sm:px-6 text-center mb-16 sm:mb-0">
          <a 
            href="/support/feedback" 
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
          >
            <Bug className="h-3.5 w-3.5" />
            Report a Bug
          </a>
        </footer>
      </div>
      <FloatingTrackerButton />
      <WelcomeTour open={isTourOpen} onOpenChange={setOpen} />
      <TimedFeedbackDialog open={showFeedbackDialog} onClose={handleDialogClose} />
    </div>
  );
}

// Wrap the AppContent in a Suspense boundary to handle useSearchParams
function AppContentWithSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-secondary/50 dark:bg-secondary/30">
        <div className="flex-grow flex flex-col items-center justify-center gap-6">
            <Logo className="h-16 w-16 text-primary" />
            <div className='flex items-center gap-4 text-muted-foreground'>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className='text-lg'>Loading your workspace...</p>
            </div>
        </div>
      </div>
    }>
      <AppContent>{children}</AppContent>
    </Suspense>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TokenProvider>
        <TourProvider>
          <AppContentWithSuspense>{children}</AppContentWithSuspense>
        </TourProvider>
      </TokenProvider>
    </AuthProvider>
  );
}
