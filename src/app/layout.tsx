import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'GigBillow — Free Time-Tracking, Invoices & Proposals',
  description: 'Track billable hours, create PDF invoices, and write client-winning proposals with AI. 10 free credits monthly.',
  openGraph: {
    title: 'GigBillow — Free Time-Tracking, Invoices & Proposals',
    description: 'Track billable hours, create PDF invoices, and write client-winning proposals with AI. 10 free credits monthly.',
    images: [
      {
        url: '/og-promanflow.png',
        width: 1200,
        height: 630,
        alt: 'GigBillow Banner',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
