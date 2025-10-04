import { Toaster } from "@/components/ui/toaster";

export default function PublicInvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <main className="p-4 sm:p-6 md:p-8 bg-muted/30 min-h-screen">
            {children}
        </main>
        <Toaster />
    </>
  );
}
