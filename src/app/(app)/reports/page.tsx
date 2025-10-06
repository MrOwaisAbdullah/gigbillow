'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { RevenueChart } from '@/components/reports/revenue-chart';
import { HoursChart } from '@/components/reports/hours-chart';
import { getInvoices } from '@/lib/api/invoices';
import { getProjects } from '@/lib/api/projects';
import { getTimeEntries } from '@/lib/api/time-entries';
import { subMonths, format, startOfMonth } from 'date-fns';
import { generateReportPdf, generateReportCsv } from '@/lib/pdf-utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<{name: string, total: number}[]>([]);
  const [hoursData, setHoursData] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChartData() {
      setLoading(true);

      const [invoicesResult, projectsResult, timeEntriesResult] = await Promise.all([
        getInvoices('first', null, 9999),
        getProjects('first', null, 9999),
        getTimeEntries(null, 9999)
      ]);

      // Process revenue data
      const paidInvoices = invoicesResult.invoices.filter(inv => inv.status === 'paid');
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
      const startOfCurrentMonth = startOfMonth(new Date());
      const monthlyEntries = timeEntriesResult.entries.filter(e => new Date(e.startTime) >= startOfCurrentMonth);
      const hoursByProject = monthlyEntries.reduce((acc, entry) => {
        const project = projectsResult.projects.find(p => p.id === entry.projectId);
        if (project) {
          acc[project.name] = (acc[project.name] || 0) + entry.hours;
        }
        return acc;
      }, {} as { [key: string]: number });
      setHoursData(Object.entries(hoursByProject).map(([name, value]) => ({ name, value })));

      setLoading(false);
    }
    fetchAllChartData();
  }, []);

  const handleExportPdf = () => {
    generateReportPdf({ revenueData, hoursData });
  };

  const handleExportCsv = () => {
    generateReportCsv({ revenueData, hoursData });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPdf} disabled={loading}>
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={loading}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
        </div>
      </div>
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
