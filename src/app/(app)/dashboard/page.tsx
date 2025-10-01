import { StatsCards } from '@/components/dashboard/stats-cards';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/track">Start Tracking</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/invoices/new">New Invoice</Link>
          </Button>
        </div>
      </div>
      <StatsCards />
      <div>
        <h2 className="text-2xl font-semibold mb-4">Outstanding Invoices</h2>
        <InvoicesTable />
      </div>
    </div>
  );
}
