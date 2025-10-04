'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';

export function FloatingTrackerButton() {
  const pathname = usePathname();

  const hiddenPaths = [
    '/track',
    '/invoices/new',
    '/clients/new',
    '/projects/new',
    '/settings',
  ];

  const shouldHide = hiddenPaths.includes(pathname) || pathname.startsWith('/invoices/');

  if (shouldHide) {
    return null;
  }

  return (
    <Link href="/track" passHref>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        aria-label="Start tracking time"
      >
        <Timer className="h-6 w-6" />
      </Button>
    </Link>
  );
}
