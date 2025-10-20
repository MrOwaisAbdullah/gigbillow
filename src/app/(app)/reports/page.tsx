
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { RevenueChart } from '@/components/reports/revenue-chart';
import { HoursChart } from '@/components/reports/hours-chart';
import { getInvoices } from '@/lib/api/invoices';
import { getProjects } from '@/lib/api/projects';
import { getTimeEntries } from '@/lib/api/time-entries';
import { getExpenses } from '@/lib/api/expenses';
import { getUserProfile } from '@/lib/api/users';
import { subDays, subMonths, format, startOfMonth, isThisWeek } from 'date-fns';
import { generateReportPdf, generateReportCsv } from '@/lib/pdf-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SummaryStats } from '@/components/dashboard/summary-stats';
import { useAuth } from '@/components/auth/auth-provider';
import { useToken } from '@/components/token/token-provider';
import { canAfford, chargeFor } from '@/lib/api/tokens';
import type { UserProfile } from '@/lib/types';

type Stats = {
  outstandingRevenue: number;
  incomeLast30d: number;
  hoursThisWeek: number;
  expensesThisMonth: number;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { openDialog } = useToken();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<{name: string, total: number}[]>([]);
  const [hoursData, setHoursData] = useState<{name: string, value: number}[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchAllReportData() {
      setLoading(true);

      const [invoicesResult, projectsResult, timeEntriesResult, expensesResult, profileResult] = await Promise.all([
        getInvoices('first', null, 9999),
        getProjects('first', null, 9999),
        getTimeEntries(null, 9999),
        getExpenses('first', null, 9999),
        getUserProfile(),
      ]);
      const invoicesData = invoicesResult.invoices;
      const projectsData = projectsResult.projects;
      const timeEntriesData = timeEntriesResult.entries;
      const expensesData = expensesResult.expenses;
      setUserProfile(profileResult);

      // Process Stats
      const thirtyDaysAgo = subDays(new Date(), 30);
      const startOfCurrentMonth = startOfMonth(new Date());

      const outstandingRevenue = invoicesData
        .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue')
        .reduce((acc, inv) => acc + inv.amount, 0);

      const incomeLast30d = invoicesData
        .filter(
          (inv) =>
            inv.status === 'paid' &&
            new Date(inv.issuedDate) >= thirtyDaysAgo
        )
        .reduce((acc, inv) => acc + inv.amount, 0);

      const hoursThisWeek = timeEntriesData
        .filter((entry) => isThisWeek(new Date(entry.startTime), { weekStartsOn: 1 }))
        .reduce((acc, entry) => acc + entry.hours, 0);
      
      const expensesThisMonth = expensesData
        .filter(exp => new Date(exp.date) >= startOfCurrentMonth)
        .reduce((acc, exp) => acc + exp.amount, 0);

      setStats({ outstandingRevenue, incomeLast30d, hoursThisWeek, expensesThisMonth });

      // Process revenue data
      const paidInvoices = invoicesData.filter(inv => inv.status === 'paid');
      const now = new Date();
      const monthlyRevenue = Array.from({ length: 12 }).map((_, i) => {
        const monthDate = subMonths(now, 11 - i);
        return { name: format(monthDate, 'MMM'), total: 0, key: format(monthDate, 'yyyy-MM') };
      });
      const revenueMap = monthlyRevenue.reduce((acc, month) => {
        acc[month.key] = month;
        return acc;
      }, {} as {[key: string]: typeof monthlyRevenue[0]});
      paidInvoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.issuedDate);
        if (invoiceDate > subMonths(now, 12)) {
          const invoiceKey = format(invoiceDate, 'yyyy-MM');
          if (revenueMap[invoiceKey]) {
            revenueMap[invoiceKey].total += invoice.amount;
          }
        }
      });
      setRevenueData(Object.values(revenueMap).map(({key, ...rest}) => rest));

      // Process hours data
      const monthlyEntries = timeEntriesData.filter(e => new Date(e.startTime) >= startOfCurrentMonth);
      const hoursByProject = monthlyEntries.reduce((acc, entry) => {
        const project = projectsData.find(p => p.id === entry.projectId);
        if (project) {
          acc[project.name] = (acc[project.name] || 0) + entry.hours;
        }
        return acc;
      }, {} as { [key: string]: number });
      setHoursData(Object.entries(hoursByProject).map(([name, value]) => ({ name, value })));

      setLoading(false);
    }
    fetchAllReportData();
  }, []);
  
  const handleExport = async (exportFn: (data: any) => void) => {
    setIsExporting(true);
    const hasTokens = await canAfford('report_export');
    if (!hasTokens) {
      openDialog();
      setIsExporting(false);
      return;
    }

    if (!stats || !userProfile) {
        setIsExporting(false);
        return;
    };
    
    exportFn({ stats, revenueData, hoursData, user: userProfile });
    await chargeFor('report_export');
    setIsExporting(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => handleExport(generateReportPdf)} disabled={loading || isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />} 
              Export PDF (-1 Token)
            </Button>
            <Button variant="outline" onClick={() => handleExport(generateReportCsv)} disabled={loading || isExporting}>
             {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />} 
              Export CSV (-1 Token)
            </Button>
        </div>
      </div>
      
      <SummaryStats stats={stats} loading={loading} />

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-[450px]" />
          <Skeleton className="h-[450px]" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <RevenueChart data={revenueData} />
          <HoursChart data={hoursData} />
        </div>
      )}
    </div>
  );
}
