'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvoices } from '@/lib/api/invoices';
import { getTimeEntries } from '@/lib/api/time-entries';
import { useEffect, useState } from "react";
import { subDays, isThisWeek } from 'date-fns';
import { TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function SummaryStats() {
  const [stats, setStats] = useState({
    outstandingRevenue: 0,
    incomeLast30d: 0,
    hoursThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [invoicesResult, timeEntriesResult] = await Promise.all([getInvoices('first', null, 9999), getTimeEntries(null, 9999)]);
      const invoicesData = invoicesResult.invoices;
      const timeEntriesData = timeEntriesResult.entries;
      
      const thirtyDaysAgo = subDays(new Date(), 30);

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

      setStats({ outstandingRevenue, incomeLast30d, hoursThisWeek });
      setLoading(false);
    }
    fetchStats();
  }, []);
  
  const statCards = [
    {
      title: 'Outstanding Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.outstandingRevenue),
      icon: AlertCircle,
      description: 'Total from unpaid invoices',
    },
    {
      title: 'Income (Last 30 d)',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.incomeLast30d),
      icon: TrendingUp,
      description: 'Based on paid invoices',
    },
    {
      title: 'Hours This Week',
      value: `${stats.hoursThisWeek.toFixed(1)}h`,
      icon: Clock,
      description: 'Total billable hours tracked',
    }
  ];

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-6" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
