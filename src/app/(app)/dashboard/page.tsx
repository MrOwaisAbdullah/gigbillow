'use client';

import { ProjectPulse } from '@/components/dashboard/project-pulse';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TodaysPulse } from '@/components/dashboard/todays-pulse';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { SummaryStats } from '@/components/dashboard/summary-stats';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api/dashboard';

type DashboardStats = {
  outstandingRevenue: number;
  incomeLast30d: number;
  hoursThisWeek: number;
  expensesThisMonth: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <SummaryStats stats={stats} loading={loading} />
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-8">
          <TodaysPulse />
          <ProjectPulse />
        </div>
        <div className="grid gap-8">
          <QuickActions />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Outstanding Invoices</h2>
        <InvoicesTable />
      </div>
    </div>
  );
}
