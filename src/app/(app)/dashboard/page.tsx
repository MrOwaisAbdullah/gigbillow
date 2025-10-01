import { ProjectPulse } from '@/components/dashboard/project-pulse';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TodaysPulse } from '@/components/dashboard/todays-pulse';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { SummaryStats } from '@/components/dashboard/summary-stats';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <SummaryStats />

      <TodaysPulse />
      
      <QuickActions />

      <ProjectPulse />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Outstanding Invoices</h2>
        <InvoicesTable />
      </div>
    </div>
  );
}
